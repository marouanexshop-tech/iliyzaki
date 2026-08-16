"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

/** Pixels per second — the same perceived speed on a phone and on a desktop. */
const SPEED = 55;

const messages = [
  { id: "delivery", text: "توصيل مجاني لجميع مدن المغرب", truck: true },
  { id: "onssa", text: "منتجاتنا مرخصة من طرف ONSSA", truck: false },
];

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4 shrink-0 text-gold-400"
    >
      <path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2" />
      <path d="M14 9h4l3 3v5a1 1 0 0 1-1 1h-1" />
      <path d="M9 18h6" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function MessageRun({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {messages.map((message) => (
        <span key={message.id} dir="rtl" className="flex shrink-0 items-center">
          <span className="flex shrink-0 items-center gap-1.5 px-5 md:px-7">
            {message.truck && <TruckIcon />}
            <span className="whitespace-nowrap text-[12px] font-semibold md:text-[13px]">
              {message.text}
            </span>
          </span>
          <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/25" />
        </span>
      ))}
    </div>
  );
}

export default function TopBar() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [repeats, setRepeats] = useState(1);
  const [duration, setDuration] = useState(0);

  /*
   * Two identical halves make the -50% loop seamless, but only if one half is
   * at least as wide as the visible strip — otherwise a gap trails the text.
   * So measure a single run and repeat it enough times to cover the viewport.
   *
   * The animation is held until that measurement lands: starting on a guessed
   * duration and correcting later re-times it mid-flight, which reads as a jump.
   */
  useLayoutEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const runCount = track.children.length;
      const runWidth = runCount > 0 ? track.scrollWidth / runCount : 0;
      if (runWidth <= 0) return;

      const needed = Math.max(1, Math.ceil(viewport.clientWidth / runWidth));
      setRepeats((prev) => (prev === needed ? prev : needed));
      setDuration((runWidth * needed) / SPEED);
    };

    // Arabic glyph widths change when the web font swaps in, so wait for it.
    const fonts = document.fonts;
    if (fonts?.ready) void fonts.ready.then(measure).catch(measure);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(viewport);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [repeats]);

  return (
    <div dir="rtl" className="w-full border-b border-gold-400/15 bg-wine-800 text-white">
      <div className="mx-auto flex h-11 max-w-7xl items-center gap-2.5 px-3 md:h-12 md:gap-3.5 md:px-4">
        {/* Pinned outside the scrolling area, so the text can never run over it. */}
        <span className="flex shrink-0 items-center rounded-md bg-white/10 px-2 py-1 ring-1 ring-white/15 ring-inset">
          {/*
           * Square artwork where ONSSA's was a wide wordmark, so it is sized on
           * both axes — left at h-[19px] w-auto it would have been a 19px square
           * lost against the bar. The brown field is keyed out of the file, so
           * the ring sits straight on the wine bar with no clipping needed.
           */}
          <Image
            src="/brand/logo.webp"
            alt="ELLY ZAKI"
            width={1080}
            height={1080}
            priority
            className="size-[26px] md:size-[30px]"
          />
        </span>

        <span aria-hidden className="h-4 w-px shrink-0 bg-white/20" />

        {/*
         * dir=ltr on the strip, not just the track: inside an RTL parent the
         * track anchors to the right edge, so leftward motion runs off into
         * empty space. Laid out LTR it anchors left and scrolls like a normal
         * marquee. Each message keeps dir=rtl so the Arabic renders correctly.
         */}
        <div
          ref={viewportRef}
          dir="ltr"
          className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18px,black_calc(100%-18px),transparent)]"
        >
          <div
            ref={trackRef}
            style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
            className={`flex w-max items-center ${duration > 0 ? "marquee-track" : ""}`}
          >
            {Array.from({ length: repeats * 2 }, (_, index) => (
              <MessageRun key={index} ariaHidden={index > 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
