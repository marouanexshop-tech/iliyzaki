"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDE_MS = 4000;

const slides = [
  {
    src: "/slider/slider-1.webp",
    alt: "منتجات مغربية بجودة عالية وأسعار مناسبة",
  },
  {
    src: "/slider/slider-2.webp",
    alt: "تقويات المناعة وزيادة الطاقة اليومية بشكل طبيعي",
  },
];

/*
 * Portrait creatives shown only below md. Same length as `slides`, so the one
 * autoplay index and the one row of dots below drive both tracks — no second
 * timer, no second piece of state, and the two can never drift apart.
 */
const mobileSlides = [
  {
    src: "/slider/slider-mobile-1.webp",
    alt: "منتجات مغربية بجودة عالية وأسعار مناسبة",
  },
  {
    src: "/slider/slider-mobile-2.webp",
    alt: "تقويات المناعة وزيادة الطاقة اليومية بشكل طبيعي",
  },
];

/*
 * Both tracks stay in the markup and are swapped with CSS, which is what keeps
 * the desktop track byte-for-byte what it was. The off-screen one would still
 * be fetched, so each `sizes` collapses to 1px at the width where its track is
 * hidden — the browser then picks the smallest candidate for the one it will
 * never paint, instead of a full-width render.
 */
function Track({
  items,
  active,
  fit,
  sizes,
  className,
}: {
  items: typeof slides;
  active: number;
  fit: string;
  sizes: string;
  className: string;
}) {
  return (
    <div className={className}>
      {items.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-opacity motion-reduce:duration-300 ${
            i === active
              ? "z-10 scale-100 opacity-100"
              : "scale-[1.04] opacity-0 motion-reduce:scale-100"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes={sizes}
            quality={90}
            priority={i === 0}
            className={`${fit} object-center`}
          />
        </div>
      ))}
    </div>
  );
}

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % slides.length),
      SLIDE_MS,
    );
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="عروض JOUD SOUS"
      className="relative w-full overflow-hidden"
    >
      {/*
       * The two phone creatives are not the same shape — 1024×1280 and
       * 960×1280 — so the taller 3/4 is used as the frame and object-contain
       * fits each one inside it whole. Cover would have shaved ~3% off the
       * edges of the 4:5 slide, which is where its price badge sits. The cost
       * is a thin band above and below that slide; the frame is wine-950 so it
       * reads as part of the design rather than as a gap.
       */}
      <Track
        items={mobileSlides}
        active={active}
        fit="object-contain"
        sizes="(min-width: 768px) 1px, 100vw"
        className="relative aspect-[3/4] w-full bg-wine-950 md:hidden"
      />

      {/* Desktop track, unchanged: source aspect 1672×941, cover, full width. */}
      <Track
        items={slides}
        active={active}
        fit="object-cover"
        sizes="(max-width: 767px) 1px, 100vw"
        className="relative hidden aspect-[1672/941] w-full md:block"
      />

      <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-5">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`الانتقال إلى الشريحة ${i + 1}`}
            aria-current={i === active}
            className={`h-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all duration-500 ${
              i === active ? "w-6 bg-white md:w-8" : "w-1.5 bg-white/55 hover:bg-white/85"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
