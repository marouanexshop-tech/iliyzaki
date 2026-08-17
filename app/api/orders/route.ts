import { NextResponse } from "next/server";

import { findPack } from "../../lib/packs";
import { appendToSheet } from "../../lib/sheet";
import { hasErrors, validateOrder, type OrderInput } from "../../lib/validation";

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
