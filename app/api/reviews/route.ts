import { NextResponse } from "next/server";

const MAX_MESSAGE = 600;

export async function POST(request: Request) {
  let body: { rating?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rating = Number(body.rating);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  /* Same rules as the browser — a client can always be bypassed. */
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 422 });
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "message_too_long" }, { status: 422 });
  }

  const review = { rating, message, createdAt: new Date().toISOString() };

  // TODO: persist the review — no database, email service or sheet is configured in this project yet.
  console.info("[review]", review);

  return NextResponse.json({ ok: true }, { status: 201 });
}
