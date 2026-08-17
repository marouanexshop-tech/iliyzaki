/* ---------------------------------------------------------------------------
 * Google Sheet delivery.
 *
 * The site posts each order to an Apps Script web app bound to the sheet, and
 * that script appends the row. It is done this way rather than through the
 * Sheets API because a service account would mean a GCP project, a private key
 * living in the environment, and sharing the sheet with a robot address — for
 * one append per order, a bound script is the smaller moving part and keeps
 * every credential inside the owner's own Google account.
 *
 * Set GOOGLE_SHEET_WEBHOOK_URL to the deployed web app URL. While it is unset
 * nothing is sent and orders are logged instead, so checkout keeps working.
 * ------------------------------------------------------------------------- */

const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "";

/* Optional. Only checked when the Apps Script has its own SECRET filled in. */
const WEBHOOK_SECRET = process.env.GOOGLE_SHEET_WEBHOOK_SECRET ?? "";

/** Apps Script can be slow to wake; past this the customer waits too long. */
const TIMEOUT_MS = 8000;

export type SheetOrder = {
  packName: string;
  total: number;
  fullName: string;
  address: string;
  city: string;
  phone: string;
  createdAt: string;
};

/**
 * Morocco-local timestamp, written as `YYYY-MM-DD HH:mm` so the column both
 * sorts correctly as text and is readable to whoever works the orders. An ISO
 * string with a Z suffix would show UTC, which is an hour off for the team.
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
 * wa.me needs the international form with no plus. Validation already accepts
 * 06…, 07…, 212… and +212…, so normalise all four to 212XXXXXXXXX and hand the
 * agent a link they can click straight from the sheet.
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
 * One row, in the sheet's own column order — A through N. The blanks are the
 * columns the call centre fills in by hand after the fact; they are still sent
 * so every row has the same width and nothing shifts left.
 */
export function toRow(order: SheetOrder): (string | number)[] {
  return [
    orderDate(order.createdAt), // A  Order date
    order.fullName, //             B  Full name
    order.phone, //                C  Phone
    order.city, //                 D  City
    order.packName, //             E  Product name
    order.total, //                F  Variant price  (number, so it can be summed)
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

/**
 * Appends the order. Resolves to false rather than throwing: a sheet outage
 * must never cost the shop a cash-on-delivery sale, so the caller confirms the
 * order either way and the row is recovered from the logs.
 */
export async function appendToSheet(order: SheetOrder): Promise<boolean> {
  if (!WEBHOOK_URL) return false;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: toRow(order), secret: WEBHOOK_SECRET }),
      // Apps Script answers the POST with a 302 to script.googleusercontent.com.
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}
