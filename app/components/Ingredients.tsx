import Reveal from "./Reveal";

type Item = { title: string; detail: string };

const ours: Item[] = [
  {
    title: "زيت الأركان الأصلي",
    detail: "كنختارو زيت أركان بجودة عالية ومصدر موثوق.",
  },
  {
    title: "زيت العود البكر",
    detail: "زيت العود مختار بعناية باش يعطي التركيبة قيمة وجودة مميزة.",
  },
  {
    title: "عسل حر طبيعي",
    detail: "كنستعملو عسل حر طبيعي، ماشي شراب سكري، مع الحرص على اختيار مصدر موثوق.",
  },
  {
    title: "مكونات مختارة بعناية",
    detail: "كل مكوّن داخل فالتركيبة كيتختار بعناية باش نحافظو على جودة المنتوج.",
  },
  {
    title: "تركيبة بجودة عالية",
    detail: "تركيبة معمولة بعناية وبمكونات واضحة ومعروفة.",
  },
];

const others: Item[] = [
  {
    title: "زيوت نباتية عادية",
    detail: "بعض التركيبات كتستعمل زيوت نباتية أقل تميزاً بدل زيوت مختارة بعناية.",
  },
  {
    title: "مكونات أقل جودة",
    detail: "ماشي جميع المنتجات كتستعمل نفس مستوى جودة المكونات.",
  },
  {
    title: "محليات أو شرابات سكرية",
    detail: "بعض المنتجات ممكن تستعمل شرابات سكرية بدل العسل الطبيعي.",
  },
  {
    title: "مكونات غير واضحة",
    detail: "المصدر والجودة ديال بعض المكونات ما كيكونوش واضحين دائماً.",
  },
  {
    title: "تركيبات معالجة بشكل كبير",
    detail: "بعض المنتجات كتكون فيها معالجة ومكونات إضافية كثيرة.",
  },
];

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-[13px]">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-[13px]">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Leaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4 text-gold-500">
      <path
        d="M20 4c0 8.5-4.9 13-11 13H5c0-8 5-13 11-13h4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M16 8c-4 1.8-7 5-8.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Card({
  title,
  items,
  featured,
}: {
  title: string;
  items: Item[];
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex h-full flex-col rounded-[26px] p-6 transition-[transform,box-shadow] duration-300 sm:p-7 ${
        featured
          ? "bg-white shadow-[0_10px_34px_rgba(44,6,16,0.08)] ring-1 ring-gold-400/35 ring-inset hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(44,6,16,0.12)]"
          : "bg-cream-50/70 shadow-[0_4px_18px_rgba(44,6,16,0.04)] ring-1 ring-wine-950/8 ring-inset hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(44,6,16,0.07)]"
      }`}
    >
      <header className="flex items-center gap-3 pb-5">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            featured ? "bg-gold-400/15 text-gold-500" : "bg-wine-950/6 text-wine-950/35"
          }`}
        >
          {featured ? <CheckMark /> : <CrossMark />}
        </span>
        <h3
          className={`text-[17px] font-extrabold tracking-tight sm:text-[19px] ${
            featured ? "text-wine-950" : "text-wine-950/55"
          }`}
        >
          {title}
        </h3>
      </header>

      {/* Hairline rule matched to the card tone, so the divider never reads as a border. */}
      <ul className={`flex-1 ${featured ? "divide-y divide-cream-200" : "divide-y divide-wine-950/6"}`}>
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <span
              className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full ${
                featured ? "bg-gold-400/12 text-gold-500" : "bg-wine-950/5 text-wine-950/30"
              }`}
            >
              {featured ? <CheckMark /> : <CrossMark />}
            </span>
            <div className="min-w-0">
              <p
                className={`text-[15px] font-bold leading-snug sm:text-[15.5px] ${
                  featured ? "text-wine-950" : "text-wine-950/60"
                }`}
              >
                {item.title}
              </p>
              <p
                className={`mt-1 text-[13.5px] leading-relaxed sm:text-[14px] ${
                  featured ? "text-wine-950/60" : "text-wine-950/40"
                }`}
              >
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Ingredients() {
  return (
    <section
      aria-label="المكونات والجودة"
      /*
       * Asymmetric padding on purpose: this now butts straight up against the
       * checkout form, whose own py-9/11 already supplies most of the breathing
       * room above. A matching pt here just stacked two full gaps into one
       * oversized void, so the top is trimmed and the bottom keeps the section
       * rhythm the rest of the page uses.
       */
      /*
       * Flat cream-50, the same value the checkout above and the origins strip
       * below carry, so the three read as one uninterrupted surface. This was a
       * cream-100 -> cream-50 gradient sitting over two decorative gold washes
       * — a botanical outline bleeding in at the top corner and a blurred orb
       * on the other side. Faint individually, but together they tinted the top
       * of the band warmer than everything around it, which is exactly the
       * banding the unified background is meant to remove. relative/isolate/
       * overflow-hidden went with them; nothing here is absolutely positioned
       * any more.
       */
      className="bg-cream-50 px-5 pb-9 pt-4 md:px-8 md:pb-11 md:pt-8"
    >
      <div className="mx-auto max-w-6xl">
        {/*
         * Desktop only. Stacked on a phone the two cards run to ten items and
         * push everything below them far down the page, so the comparison is
         * dropped there and the closing note underneath carries the section.
         * display:none also keeps Reveal's observer from firing, so nothing
         * animates off-screen; it still fires normally if the viewport is
         * widened past md.
         */}
        <Reveal className="hidden md:block">
          <div className="grid items-stretch gap-5 md:grid-cols-2 md:gap-7">
            <Card title="شنو كنستعملو حنا؟" items={ours} featured />
            <Card title="المنتجات العادية" items={others} />
          </div>
        </Reveal>

        <Reveal delay={140}>
          {/* mt-12 existed to clear the cards above; with those gone below md it
              would just be dead space, so the gap starts at md. */}
          <div className="mx-auto mt-0 max-w-2xl text-center md:mt-12">
            <span aria-hidden className="mx-auto block h-px w-16 bg-gradient-to-l from-transparent via-gold-400/60 to-transparent" />
            <span className="mt-6 flex items-center justify-center gap-2">
              <Leaf />
              <h3 className="text-[18px] font-extrabold tracking-tight text-wine-950 sm:text-[20px]">
                الجودة كتبدا من المكونات
              </h3>
            </span>
            <p className="mt-3 text-[14px] leading-relaxed text-wine-950/60 sm:text-[15px]">
              &quot;كنآمنو أن المنتوج الزوين كيبدا من اختيار المكونات بعناية، الجودة، والمصدر
              الواضح.&quot;
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
