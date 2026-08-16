export type Pack = {
  id: string;
  name: string;
  image: string;
  /** Dirhams. The label is derived so the checkout total and the card price can never drift apart. */
  price: number;
  badge: string | null;
  /**
   * Small tag shown only on the checkout picker rows. Kept separate from
   * `badge` so the product cards above stay exactly as they are.
   */
  pickerBadge?: { text: string; tone: "soft" | "strong" };
  /** One-line summary used by the compact checkout picker. */
  description: string;
  /** What the bundle contains — shown on the product cards. */
  bundle: { lead: string; items: string[] };
};

const LEAD = "باقة مختارة كتجمع بين:";

/* Single source of truth: the product cards and the COD checkout both read from here. */
export const packs: Pack[] = [
  {
    id: "baqat-almo-1",
    name: "باقة أملو الأصيلة",
    image: "/products/baqat-almo-2.webp",
    price: 349,
    badge: null,
    description:
      "باقة مختارة من المكسرات والفواكه الجافة بالعسل، طبيعية 100% وغنية بالطاقة اللي كتحتاجها كل يوم.",
    bundle: {
      lead: LEAD,
      items: [
        "مكسرات بالعسل / حجم كبير",
        "أملو كاوكاو بزيت الزيتون / حجم كبير",
        "أملو لوز بزيت أركان / حجم صغير",
        "كريمة الكاجو / حجم صغير",
      ],
    },
  },
  {
    id: "baqat-almo-2",
    name: "باقة أملو الفاخرة",
    image: "/products/baqat-almo-1.webp",
    price: 399,
    badge: null,
    pickerBadge: { text: "اختيار مناسب", tone: "soft" },
    description:
      "عسل طبيعي صافي بمذاق غني، مناسب لتحلية يومك وتقوية المناعة بشكل طبيعي.",
    bundle: {
      lead: LEAD,
      items: [
        "أملو كاوكاو بزيت الزيتون / حجم كبير",
        "مكسرات بالعسل / حجم كبير",
        "أملو لوز بزيت أركان / حجم كبير",
        "كريمة الكاجو / حجم صغير",
      ],
    },
  },
];

export const priceLabel = (price: number) => `${price} DH`;

export const findPack = (id: string) => packs.find((pack) => pack.id === id);
