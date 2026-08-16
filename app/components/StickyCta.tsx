"use client";

import { useEffect, useState } from "react";

import { priceLabel } from "../lib/packs";
import { useCheckout } from "./CheckoutProvider";

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-[18px] shrink-0"
    >
      <path d="M2.5 3h2.1l2.6 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6" />
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
    </svg>
  );
}

export default function StickyCta() {
  const { selected, status, requestSubmit } = useCheckout();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onScroll = () => setRevealed(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (status === "done") return null;

  const busy = status === "submitting";
  const label = busy ? "جاري الإرسال…" : "اطلب الآن";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none md:inset-x-auto md:bottom-6 md:start-6 ${
        revealed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="border-t border-wine-950/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:rounded-full md:border md:border-wine-950/8 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {/*
         * The float lives on its own wrapper rather than on the button. The
         * button already spends `transform` on active:scale and the desktop
         * hover lift, and a keyframe animation on the same property would win
         * over those transitions and kill them — so the two are kept on
         * separate elements. The wrapper only carries a transform, so it adds
         * no box of its own: w-full/md:w-auto mirrors the button and the
         * measured layout is identical to before.
         */}
        <div className="cta-float w-full md:w-auto">
          <button
            type="button"
            onClick={requestSubmit}
            disabled={busy}
            aria-label={`${label} — ${priceLabel(selected.price)}`}
            className="cta-shine flex w-full items-center justify-center gap-2.5 rounded-full bg-wine-800 py-3.5 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(44,6,16,0.18)] transition-[background-color,transform] duration-200 hover:bg-wine-900 active:scale-[0.99] disabled:opacity-60 md:w-auto md:px-6 md:py-3 md:text-[14px] md:hover:-translate-y-0.5"
          >
            <CartIcon />
            <span>{label}</span>
            <span aria-hidden className="opacity-50">
              —
            </span>
            <span dir="ltr" aria-hidden className="tabular-nums">
              {priceLabel(selected.price)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
