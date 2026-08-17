/* ---------------------------------------------------------------------------
 * Google Sheets, server side only.
 *
 * Auth is a service-account JWT signed here and exchanged for an access token,
 * then plain REST calls to the Sheets v4 API. google-auth-library is the whole
 * dependency — the full googleapis SDK is tens of megabytes and all of it would
 * land in the serverless bundle for two endpoints.
 *
 * Nothing here may be imported from a client component: the private key lives
 * in the environment and must never reach the browser.
 *
 * Columns are matched by READING THE HEADER ROW, not by hard-coded positions.
 * The sheet's own header row is the contract, so renaming H from "Call center
 * status" to "Total QTE", inserting a column, or reordering them keeps working
 * without a redeploy. A value whose header is absent is simply not written; a
 * header this code knows nothing about is left blank rather than overwritten.
 * ------------------------------------------------------------------------- */

import { JWT } from "google-auth-library";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";

/*
 * Vercel stores the key as one line with literal backslash-n, so the real
 * newlines must be put back or the PEM parser rejects it. A genuine multi-line
 * value works too — then there is nothing to replace.
 */
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

/** Tab to read and write. */
const TAB = process.env.GOOGLE_SHEETS_TAB ?? "feuille1 pack";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

/** Headers are re-read this often, so edits in the sheet land without a deploy. */
const HEADER_TTL_MS = 5 * 60 * 1000;

export const sheetConfigured = Boolean(SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);

export type SheetOrder = {
  packName: string;
  total: number;
  quantity: number;
  fullName: string;
  address: string;
  city: string;
  phone: string;
  createdAt: string;
};

/*
 * A1 notation ends the sheet name at a space, so "feuille1 pack" must be
 * quoted or the API looks for a tab called "feuille1" and fails. Literal quotes
 * inside a name double, per A1 rules.
 */
const quotedTab = () => `'${TAB.replace(/'/g, "''")}'`;

/** Wide enough for any plausible header row; Sheets trims to what exists. */
const dataRange = () => `${quotedTab()}!A:Z`;
const headerRange = () => `${quotedTab()}!1:1`;

let cachedClient: JWT | null = null;

/*
 * One client per warm instance — building a JWT per call means a round trip to
 * Google for a fresh token on the critical path of every checkout.
 */
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

async function sheetsGet(range: string) {
  const url = `${SHEETS_API}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(`sheets read failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as { values?: string[][] };
}

/** "Total QTE" and "total qte" are the same column; so are stray double spaces. */
const normalize = (header: string) => header.trim().toLowerCase().replace(/\s+/g, " ");

/** "Order date" -> orderDate, "Total QTE" -> totalQte, "Address 1" -> address1 */
function camelKey(header: string) {
  const words = normalize(header)
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return "column";
  return words
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join("");
}

let headerCache: { at: number; headers: string[] } | null = null;

async function headers(): Promise<string[]> {
  if (headerCache && Date.now() - headerCache.at < HEADER_TTL_MS) return headerCache.headers;
  const data = await sheetsGet(headerRange());
  const row = (data.values?.[0] ?? []).map((h) => (h ?? "").toString());
  headerCache = { at: Date.now(), headers: row };
  return row;
}

/**
 * Morocco-local timestamp as `YYYY-MM-DD HH:mm`. An ISO string shows UTC, an
 * hour behind, which is wrong for whoever works the orders.
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
 * 212… and +212…, so all four normalise and the agent gets a clickable link.
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
 * What this project knows how to fill, keyed by header text. Several spellings
 * map to the same value so the sheet can say "Total QTE", "QTE" or "Quantity".
 *
 * Anything not listed — Call center status, Tracking, Delivery status, Comment,
 * Agent Confirmation — is deliberately absent: those are filled in by hand
 * after the call, and writing "" into them on every append would be the same
 * thing but noisier.
 */
function valuesByHeader(order: SheetOrder): Record<string, string | number> {
  return {
    "order date": orderDate(order.createdAt),
    date: orderDate(order.createdAt),
    "full name": order.fullName,
    name: order.fullName,
    phone: order.phone,
    city: order.city,
    "product name": order.packName,
    product: order.packName,
    "variant price": order.total,
    price: order.total,
    "address 1": order.address,
    address: order.address,
    "total qte": order.quantity,
    qte: order.quantity,
    quantity: order.quantity,
    whatsapp: whatsappLink(order.phone),
    source: "website",
  };
}

/** Order laid out to match the live header row. Exported for testing. */
export function toRow(order: SheetOrder, headerRow: string[]): (string | number)[] {
  const values = valuesByHeader(order);
  return headerRow.map((header) => values[normalize(header)] ?? "");
}

/**
 * Appends one order. Resolves false instead of throwing: a Sheets outage must
 * never cost a cash-on-delivery sale, so the caller confirms either way and the
 * row is recoverable from the logs.
 */
export async function appendToSheet(order: SheetOrder): Promise<boolean> {
  if (!sheetConfigured) {
    console.error("[sheet] not configured — set the Google env vars");
    return false;
  }

  try {
    const headerRow = await headers();
    if (headerRow.length === 0) {
      console.error("[sheet] header row is empty — cannot place the columns");
      return false;
    }

    const url =
      `${SHEETS_API}/${SPREADSHEET_ID}/values/${encodeURIComponent(dataRange())}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ values: [toRow(order, headerRow)] }),
    });

    if (!response.ok) {
      // Google's own message names the cause: bad key, wrong tab, not shared.
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
 * Every order, newest first, keyed by the sheet's own headers in camelCase —
 * so the dashboard follows the sheet if a column is renamed or added.
 */
export async function readOrders(): Promise<Record<string, string>[]> {
  if (!sheetConfigured) throw new Error("sheet not configured");

  const data = await sheetsGet(dataRange());
  const rows = data.values ?? [];
  if (rows.length === 0) return [];

  const [headerRow, ...body] = rows;
  const keys = headerRow.map(camelKey);

  return body
    .filter((row) => row.some((cell) => (cell ?? "").toString().trim() !== ""))
    .map((row) => {
      const entry: Record<string, string> = {};
      keys.forEach((key, i) => {
        entry[key] = (row[i] ?? "").toString();
      });
      return entry;
    })
    .reverse();
}
