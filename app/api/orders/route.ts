import { NextResponse } from "next/server";

import { findPack } from "../../lib/packs";
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

  // TODO: persist the order — no database, email service or sheet is configured in this project yet.
  console.info("[order]", order);

  return NextResponse.json({ ok: true, total: pack.price }, { status: 201 });
}
