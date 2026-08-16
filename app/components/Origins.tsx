"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Pixels per second for the phone marquee — half the announcement bar's pace. */
const SPEED = 28;

/*
 * How long the strip stays still after the visitor last touched it. Long enough
 * that a tap buys time to actually read a card — and it doubles as cover for
 * iOS momentum, which keeps scrolling after the finger is gone and would
 * otherwise fight the next frame.
 */
const RESUME_MS = 2500;

type Origin = { src: string; title: string; detail: string };

const origins: Origin[] = [
  {
    src: "/origins/nuts.webp",
    title: "مكسرات مختارة بعناية",
    detail:
      "مكسرات ذات جودة عالية، تُعالج بدقة لإزالة الشوائب، مع تحميص متوازن يحافظ على مذاقها وجودتها.",
  },
  {
    src: "/origins/honey.webp",
    title: "عسل حر طبيعي",
    detail:
      "عسل حر طبيعي من مصدر موثوق ومرخّص من طرف ONSSA، نختاره بعناية لضمان الجودة والنقاء.",
  },
  {
    src: "/origins/argan.webp",
    title: "زيت أركان حر أصيل",
    detail:
      "زيت أركان حر أصيل، يُستخلص بالطريقة التقليدية اليدوية للحفاظ على جودته وخصائصه الطبيعية.",
  },
  {
    src: "/origins/amlou.webp",
    title: "أملو طبيعي أصيل",
    detail:
      "أملو طبيعي غني، محضّر من مكونات طبيعية مختارة بعناية، مع الحرص على الجودة والنظافة وبدون غش في المكونات.",
  },
];

function OriginItem({
  item,
  circle,
  sizes,
}: {
  item: Origin;
  circle: string;
  sizes: string;
}) {
  return (
    <figure className="flex flex-col items-center text-center">
      {/*
       * Same circular treatment the checkout picker already uses for its
       * thumbnails, plus the shadow token the product and checkout cards carry,
       * so the discs sit in the page's material language rather than reading as
       * flat cut-outs on the cream.
       */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-white shadow-[0_1px_3px_rgba(44,6,16,0.05)] ring-1 ring-wine-950/10 ring-inset ${circle}`}
      >
        <Image src={item.src} alt={item.title} fill sizes={sizes} quality={90} className="object-cover" />
      </div>
      <figcaption>
        <h3 className="mt-4 text-[14.5px] font-extrabold tracking-tight text-wine-950 md:text-[16px]">
          {item.title}
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-wine-950/60 md:text-[13.5px]">
          {item.detail}
        </p>
      </figcaption>
    </figure>
  );
}

export default function Origins() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  /*
   * The phone strip is a real overflow-x scroller rather than a transformed
   * track, because the brief asks for both a continuous marquee and a normal
   * swipe — and you cannot swipe a CSS transform. So the drift is driven by
   * writing scrollLeft each frame, which leaves native touch scrolling, its
   * momentum and its accessibility intact.
   *
   * The list is rendered twice; once the offset passes one half it is rolled
   * back by exactly that half. Both halves are identical, so the reset lands on
   * a pixel-identical frame and there is no visible jump or gap.
   */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    let pausedUntil = 0;
    let pos = el.scrollLeft;

    const hold = () => {
      pausedUntil = performance.now() + RESUME_MS;
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      // A backgrounded tab resumes with a huge delta; clamp so it never lurches.
      const dt = Math.min(now - last, 50);
      last = now;

      const half = el.scrollWidth / 2;
      if (half <= 0) return;

      if (now < pausedUntil) {
        // The visitor is driving. Follow their position instead of setting it.
        pos = el.scrollLeft;
        return;
      }

      pos += (SPEED * dt) / 1000;
      if (pos >= half) pos -= half;
      el.scrollLeft = pos;
    };

    raf = requestAnimationFrame(step);
    el.addEventListener("pointerdown", hold);
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("touchmove", hold, { passive: true });
    el.addEventListener("wheel", hold, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchmove", hold);
      el.removeEventListener("wheel", hold);
    };
  }, []);

  return (
    <section
      aria-label="مصادر المكونات"
      /*
       * cream-50, not white. White belongs to the top band (SocialProof,
       * ProductCards); everything from the checkout down is cream, so white
       * here read as a slab borrowed from the wrong half of the page. Cream
       * also gives the circles an edge — the photographs are shot on white, so
       * on a white ground they dissolved into it and only the hairline ring
       * held them together.
       */
      className="bg-cream-50 px-5 py-9 md:px-8 md:py-11"
    >
      {/* Desktop: four static columns. */}
      <div className="mx-auto hidden max-w-6xl md:grid md:grid-cols-4 md:gap-8">
        {origins.map((item) => (
          <OriginItem
            key={item.src}
            item={item}
            circle="size-40"
            sizes="(max-width: 767px) 1px, 160px"
          />
        ))}
      </div>

      {/*
       * dir=ltr on the scroller for the same reason the announcement bar does
       * it: inside an RTL parent the track anchors to the right edge and
       * leftward motion runs off into empty space. Each card keeps dir=rtl so
       * the Arabic renders correctly. Negative margins let the strip bleed to
       * both screen edges while the section keeps its px-5, so a card is
       * already half-visible at the edge and the row reads as scrollable.
       */}
      <div
        ref={scrollerRef}
        dir="ltr"
        className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto overscroll-x-contain px-5 md:hidden"
      >
        {/* Second pass is presentational only — screen readers read the list once. */}
        {[...origins, ...origins].map((item, i) => (
          <div
            key={`${item.src}-${i}`}
            dir="rtl"
            aria-hidden={i >= origins.length}
            className="w-[64vw] max-w-[260px] shrink-0"
          >
            <OriginItem item={item} circle="size-32" sizes="(min-width: 768px) 1px, 128px" />
          </div>
        ))}
      </div>
    </section>
  );
}
