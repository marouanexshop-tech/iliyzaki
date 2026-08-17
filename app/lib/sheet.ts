/* ---------------------------------------------------------------------------
 * Google Sheets, server side only.
 *
 * Auth is a service account JWT signed here and exchanged for an access token,
 * then plain REST calls to the Sheets v4 API. google-auth-library is the whole
 * dependency — the full googleapis SDK is tens of megabytes and every byte of
 * it lands in the serverless bundle for two endpoints.
 *
 * Nothing in this file may be imported from a client component: the private key
 * lives in the environment and must never reach the browser.
 * ------------------------------------------------------------------------- */

import { JWT } from "google-auth-library";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";

/*
 * Vercel stores the key as a single line with literal backslash-n, so the real
 * newlines have to be put back or the PEM parser rejects it. Pasting a genuine
 * multi-line value works too — then there is nothing to replace.
 */
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

/** Tab to read and write. Overridable, but this is the one that exists today. */
const TAB = process.env.GOOGLE_SHEETS_TAB ?? "feuille1 pack";

/** Columns A..N, matching the sheet's header row. */
const COLUMNS = "A:N";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

export const sheetConfigured = Boolean(SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);

export type SheetOrder = {
  packName: string;
  total: number;
  fullName: string;
  address: string;
  city: string;
  phone: string;
  createdAt: string;
};

export type StoredOrder = {
  orderDate: string;
  fullName: string;
  phone: string;
  city: string;
  productName: string;
  price: number | null;
  address: string;
  callCenterStatus: string;
  tracking: string;
  deliveryStatus: string;
  whatsapp: string;
  comment: string;
  agentConfirmation: string;
  source: string;
};

/*
 * A1 notation treats a space as the end of the sheet name, so "feuille1 pack"
 * has to be wrapped in single quotes or the API reads it as sheet "feuille1"
 * and fails. Any literal quote inside a tab name doubles, per A1 rules.
 */
function range() {
  return `'${TAB.replace(/'/g, "''")}'!${COLUMNS}`;
}

/*
 * One client per warm instance. Building a JWT mints a new access token on
 * every call otherwise, which is a round trip to Google on the critical path of
 * every single checkout.
 */
let cachedClient: JWT | null = null;

function client() {
  if (!cachedClient) {
    cachedClient = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return cachedClient;
}

async function authHeaders() {
  const { token } = await client().getAccessToken();
  if (!token) throw new Error("no access token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/**
 * Morocco-local timestamp as `YYYY-MM-DD HH:mm`. An ISO string would show UTC,
 * an hour behind, which is wrong for whoever works the orders.
 */
function orderDate(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

/**
 * wa.me wants the international form with no plus. Validation accepts 06…, 07…,
 * 212… and +212…, so all four normalise to 212XXXXXXXXX and the agent gets a
 * link they can click straight out of the sheet.
 */
function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("212")
    ? digits
    : digits.startsWith("0")
      ? `212${digits.slice(1)}`
      : digits;
  return international ? `https://wa.me/${international}` : "";
}

/**
 * One row in the sheet's own column order, A through N. The blanks are the
 * columns the call centre fills in by hand; they are still written so every row
 * has the same width and nothing shifts left.
 */
export function toRow(order: SheetOrder): (string | number)[] {
  return [
    orderDate(order.createdAt), // A  Order date
    order.fullName, //             B  Full name
    order.phone, //                C  Phone
    order.city, //                 D  City
    order.packName, //             E  Product name
    order.total, //                F  Variant price  (number, so it sums)
    order.address, //              G  Address 1
    "", //                         H  Call center status
    "", //                         I  Tracking
    "", //                         J  Delivery status
    whatsappLink(order.phone), //  K  WhatsApp
    "", //                         L  Comment
    "", //                         M  Agent Confirmation
    "website", //                  N  Source
  ];
}

/** Inverse of toRow, for the admin dashboard endpoint. */
function fromRow(row: string[]): StoredOrder {
  const at = (i: number) => (row[i] ?? "").toString().trim();
  const price = Number(at(5).replace(/[^\d.-]/g, ""));
  return {
    orderDate: at(0),
    fullName: at(1),
    phone: at(2),
    city: at(3),
    productName: at(4),
    price: Number.isFinite(price) && at(5) !== "" ? price : null,
    address: at(6),
    callCenterStatus: at(7),
    tracking: at(8),
    deliveryStatus: at(9),
    whatsapp: at(10),
    comment: at(11),
    agentConfirmation: at(12),
    source: at(13),
  };
}

/**
 * Appends one order. Resolves false instead of throwing: a Sheets outage must
 * never cost a cash-on-delivery sale, so the caller confirms either way and the
 * row is recovered from the logs.
 */
export async function appendToSheet(order: SheetOrder): Promise<boolean> {
  if (!sheetConfigured) {
    console.error("[sheet] not configured — set the Google env vars");
    return false;
  }

  try {
    const url =
      `${SHEETS_API}/${SPREADSHEET_ID}/values/${encodeURIComponent(range())}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ values: [toRow(order)] }),
    });

    if (!response.ok) {
      // Google's message names the real cause (bad tab, key, or sharing).
      console.error("[sheet] append failed", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[sheet] append threw", error);
    return false;
  }
}

/**
 * Every order, newest first. The header row is dropped by matching its first
 * cell rather than by always skipping row 1, so a sheet without headers still
 * returns all of its data.
 */
export async function readOrders(): Promise<StoredOrder[]> {
  if (!sheetConfigured) throw new Error("sheet not configured");

  const url = `${SHEETS_API}/${SPREADSHEET_ID}/values/${encodeURIComponent(range())}`;
  const response = await fetch(url, { headers: await authHeaders() });

  if (!response.ok) {
    throw new Error(`sheets read failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { values?: string[][] };
  const rows = data.values ?? [];

  return rows
    .filter((row) => row.length > 0 && (row[0] ?? "").trim().toLowerCase() !== "order date")
    .map(fromRow)
    .reverse();
}
