import { NextResponse } from "next/server";

import { findPack } from "../../lib/packs";
import { appendToSheet, readOrders, sheetConfigured } from "../../lib/sheet";
import { hasErrors, validateOrder, type OrderInput } from "../../lib/validation";

/* The service-account JWT is signed with node crypto, so not the edge runtime. */
export const runtime = "nodejs";

/* Orders change on every checkout; a cached GET would serve a stale list. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Partial<OrderInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input: OrderInput = {
    packId: String(body.packId ?? ""),
    fullName: String(body.fullName ?? ""),
    address: String(body.address ?? ""),
    city: String(body.city ?? ""),
    phone: String(body.phone ?? ""),
  };

  /* Same rules as the browser — a client can always be bypassed. */
  const errors = validateOrder(input);
  if (hasErrors(errors)) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  /* Price comes from the server's pack table, never from the request body. */
  const pack = findPack(input.packId)!;

  const order = {
    packId: pack.id,
    packName: pack.name,
    total: pack.price,
    /*
     * The checkout has no quantity control — one submission is one pack — so
     * this is 1 by definition, not a value the customer can send. It is kept
     * as a field rather than a literal so that adding a quantity selector later
     * is a change in one place.
     */
    quantity: 1,
    currency: "MAD",
    payment: "cod",
    fullName: input.fullName.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
  };

  /*
   * Awaited, not fired and forgotten: on Vercel the function can be frozen the
   * moment the response is returned, which would kill an in-flight request and
   * drop the row.
   */
  const delivered = await appendToSheet(order);

  /*
   * A failed append is logged at error level with the whole order, so nothing
   * is ever unrecoverable — the row can be re-entered from the Vercel logs. The
   * customer is still confirmed regardless: this is cash on delivery, and the
   * shop would rather chase a missing row than lose the sale.
   */
  if (delivered) console.info("[order] sheet ok", order.phone);
  else console.error("[order] sheet failed — recover this row manually", order);

  return NextResponse.json({ ok: true, total: pack.price }, { status: 201 });
}

/**
 * Orders as JSON for the admin dashboard, newest first.
 *
 * Every row is customer personal data — full name, phone, home address — so
 * this is gated on a bearer token and fails closed: with ORDERS_API_TOKEN unset
 * the endpoint refuses rather than serving the list to anyone who guesses the
 * URL. An open version of this route would publish the shop's entire customer
 * list to the internet.
 */
export async function GET(request: Request) {
  const expected = process.env.ORDERS_API_TOKEN ?? "";
  if (!expected) {
    return NextResponse.json(
      { error: "orders_api_disabled", hint: "set ORDERS_API_TOKEN to enable" },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const supplied = header.startsWith("Bearer ")
    ? header.slice(7)
    : (new URL(request.url).searchParams.get("token") ?? "");

  if (supplied !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!sheetConfigured) {
    return NextResponse.json({ error: "sheet_not_configured" }, { status: 503 });
  }

  try {
    const orders = await readOrders();
    return NextResponse.json({ ok: true, count: orders.length, orders });
  } catch (error) {
    console.error("[orders] read failed", error);
    return NextResponse.json({ error: "sheet_read_failed" }, { status: 502 });
  }
}
