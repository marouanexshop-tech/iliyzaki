"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";

import Reveal from "./Reveal";

const MAX_MESSAGE = 600;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`size-8 transition-[color,transform] duration-200 sm:size-9 ${
        filled ? "scale-105 text-gold-500" : "text-wine-950/15"
      }`}
      fill="currentColor"
    >
      <path d="M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.57L2.45 9.14l6.6-.96z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-7 text-wine-800">
      <path d="M12 21s-7.5-4.6-9.4-8.7C1.1 9 2.6 5.5 6 4.6c2.2-.6 4.4.4 6 2.3 1.6-1.9 3.8-2.9 6-2.3 3.4.9 4.9 4.4 3.4 7.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export default function ThankYou() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "sending") return;

      if (rating === 0) {
        setError("المرجو اختيار عدد النجوم أولًا.");
        return;
      }

      setError(null);
      setStatus("sending");
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, message: message.trim() }),
        });
        if (!response.ok) throw new Error("rejected");
        setStatus("sent");
      } catch {
        setStatus("idle");
        setError("تعذّر إرسال رأيك. المرجو المحاولة مرة أخرى.");
      }
    },
    [message, rating, status],
  );

  const shown = hovered || rating;

  return (
    <main className="min-h-full bg-cream-50 px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[560px]">
        <Reveal>
          <div className="rounded-2xl border border-wine-950/6 bg-white px-5 py-8 text-center shadow-[0_1px_3px_rgba(44,6,16,0.05)] sm:px-8 sm:py-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-wine-50 ring-1 ring-wine-100 ring-inset">
              <HeartIcon />
            </span>

            <h1 className="mt-5 text-balance text-[23px] font-extrabold leading-[1.4] text-wine-950 sm:text-[27px]">
              شكرًا بزاف على ثقتكم فينا ❤️
            </h1>

            <p className="mt-3 text-balance text-[14px] leading-relaxed text-wine-950/65 sm:text-[15px]">
              إن شاء الله توصلكم الطلبية ديالكم بخير وعلى خير، ونتمنى يعجبكم المذاق ديالنا ويكون
              عند حسن ظنكم.
            </p>

            <p className="mt-5 rounded-xl bg-cream-100 px-4 py-3 text-balance text-[14px] font-bold leading-relaxed text-wine-950">
              الله يبارك ليكم فيها، بالصحة والراحة، ونتلاقاو ديما على الخير 🤲
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-5 rounded-2xl border border-wine-950/6 bg-white px-5 py-7 shadow-[0_1px_3px_rgba(44,6,16,0.05)] sm:px-8">
            {status === "sent" ? (
              <div className="text-center">
                <h2 className="text-[19px] font-extrabold text-wine-950 sm:text-[21px]">
                  شكرًا بزاف على رأيك ❤️
                </h2>
                <p className="mt-2.5 text-balance text-[14px] leading-relaxed text-wine-950/65">
                  كلامكم كيهمنا بزاف وكيشجعنا باش نقدمو ليكم ديما الأفضل.
                </p>
                <span
                  aria-label={`تقييمك ${rating} من 5`}
                  className="mt-4 flex items-center justify-center gap-1"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <StarIcon key={value} filled={value <= rating} />
                  ))}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2 className="text-center text-[19px] font-extrabold text-wine-950 sm:text-[21px]">
                  رأيك كيعنينا ❤️
                </h2>
                <p className="mt-2 text-balance text-center text-[13px] leading-relaxed text-wine-950/60 sm:text-[14px]">
                  من بعد ما تجرب المنتوج، شارك معنا تجربتك بكلمة زوينة.
                </p>

                <fieldset
                  className="mt-5 min-w-0"
                  onMouseLeave={() => setHovered(0)}
                  onBlur={() => setHovered(0)}
                >
                  <legend className="sr-only">التقييم من 1 إلى 5 نجوم</legend>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        onMouseEnter={() => setHovered(value)}
                        title={`${value} من 5`}
                        className="cursor-pointer rounded-md p-0.5 focus-within:ring-2 focus-within:ring-wine-800/30"
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          checked={rating === value}
                          onChange={() => {
                            setRating(value);
                            setError(null);
                          }}
                          onFocus={() => setHovered(value)}
                          className="sr-only"
                        />
                        <StarIcon filled={value <= shown} />
                        {/* Arabic counts differ for one and two, so "1 نجوم" would be wrong. */}
                        <span className="sr-only">
                          {value === 1 ? "نجمة واحدة" : value === 2 ? "نجمتان" : `${value} نجوم`}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label htmlFor="review-message" className="sr-only">
                  رسالتك
                </label>
                <textarea
                  id="review-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE))}
                  rows={4}
                  placeholder="كتب لينا رأيك وتجربتك مع المنتوج…"
                  className="mt-4 w-full resize-none rounded-xl border border-wine-950/12 bg-white px-3.5 py-3 text-sm leading-relaxed text-wine-950 outline-none transition-colors duration-200 placeholder:text-wine-950/30 focus:border-wine-800 focus:ring-2 focus:ring-wine-800/15"
                />

                {error && (
                  <p role="alert" className="mt-2 text-center text-[12px] font-medium text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-4 w-full rounded-full bg-wine-800 py-3 text-[14px] font-bold text-white transition-colors duration-200 hover:bg-wine-900 disabled:opacity-60"
                >
                  {status === "sending" ? "جارٍ الإرسال…" : "شارك رأيك"}
                </button>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal delay={220}>
          <Link
            href="/"
            className="premium-ring mt-5 block rounded-full border border-wine-950/25 bg-white py-3 text-center text-[14px] font-bold text-wine-950 transition-colors duration-200 hover:border-wine-950/40 hover:bg-cream-50"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
