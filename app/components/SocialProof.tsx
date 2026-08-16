import Image from "next/image";

import Reveal from "./Reveal";

const RATING = "4.9/5";
const CUSTOMERS = "26,000";

/* Real customers, same people whose voice notes play further down the page. */
const avatars = [
  { src: "/avatars/amina.webp", name: "أمينة" },
  { src: "/avatars/rachid.webp", name: "رشيد" },
  { src: "/avatars/khalid.webp", name: "خالد" },
];

const benefits = [
  "منتجات مختارة بعناية",
  "جودة عالية تستحق ثقتك",
  "منتجات موثوقة ومعتمدة",
  "اختيار طبيعي يناسب احتياجاتك",
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[15px]">
      <path d="M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.57L2.45 9.14l6.6-.96z" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="mx-0.5 inline-block size-[15px] shrink-0 -translate-y-px align-middle"
    >
      <circle cx="12" cy="12" r="11" className="fill-gold-500" />
      <path
        d="M7.5 12.4l3.1 3.1 6-6.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-wine-50 ring-1 ring-wine-100 ring-inset">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="size-3.5 text-wine-700"
      >
        <path d="M5 12.8l4.2 4.2L19 6.6" />
      </svg>
    </span>
  );
}

export default function SocialProof() {
  // Tighter on top so it sits close under the slider; the bottom keeps the page rhythm.
  return (
    <section className="bg-white px-5 pb-5 pt-4 md:px-8 md:pb-6 md:pt-5">
      {/* Inner block has no auto margins, so in RTL it sits flush against the right edge. */}
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-start">
          <Reveal>
            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center gap-0.5 text-gold-500"
                role="img"
                aria-label={`تقييم ${RATING}`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} />
                ))}
              </span>
              <span className="text-sm font-bold text-wine-950">{RATING}</span>
              <span aria-hidden className="h-3.5 w-px bg-wine-950/15" />
              <span className="text-xs font-medium text-wine-950/55">تقييمات موثّقة</span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2 className="mt-3 text-balance text-[27px] font-extrabold leading-[1.32] tracking-tight text-wine-950 sm:text-4xl md:text-[42px]">
              اختيارك الطبيعي يبدأ من هنا
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-4 flex w-fit max-w-full items-center gap-3 rounded-2xl border border-wine-950/8 bg-cream-50 px-4 py-2.5 shadow-[0_1px_3px_rgba(44,6,16,0.04)]">
              <span className="flex shrink-0 items-center">
                {avatars.map((avatar, i) => (
                  <span
                    key={avatar.src}
                    title={avatar.name}
                    style={{ zIndex: avatars.length - i }}
                    className={`relative size-8 overflow-hidden rounded-full border-2 border-white ${i > 0 ? "-ms-2.5" : ""}`}
                  >
                    {/* object-cover crops to the circle without ever squashing a face. */}
                    <Image src={avatar.src} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                ))}
              </span>
              <p className="text-start text-[13px] leading-snug text-wine-950/75 sm:text-sm">
                سارة، أمينة
                <VerifiedIcon />
                وأكثر من <strong className="font-bold text-wine-950">{CUSTOMERS}</strong> زبون يثقون
                في AMLO
              </p>
            </div>
          </Reveal>

          <Reveal delay={270}>
            <h3 className="mt-6 text-lg font-bold text-wine-950 sm:text-xl">
              4 أسباب تجعل زبائننا يفضلون AMLO
            </h3>
          </Reveal>

          <ul className="mt-2.5 w-fit max-w-full">
            {benefits.map((benefit, i) => (
              <Reveal key={benefit} as="li" delay={340 + i * 80}>
                <span className="flex items-center gap-2.5 py-1 text-start">
                  <CheckIcon />
                  <span className="text-[15px] font-medium text-wine-950/85 sm:text-base">
                    {benefit}
                  </span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
