import Image from "next/image";

import { packs as products, priceLabel } from "../lib/packs";
import OrderButton from "./OrderButton";
import Reveal from "./Reveal";

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
      className="size-4 shrink-0"
    >
      <path d="M2.5 3h2.1l2.6 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6" />
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
    </svg>
  );
}

export default function ProductCards() {
  // Top is tight because the trust block above leads straight into the packs.
  return (
    <section id="products" className="scroll-mt-4 bg-white px-5 pb-9 pt-5 md:px-8 md:pb-11 md:pt-6">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="text-center text-[25px] font-extrabold leading-[1.35] tracking-tight text-wine-950 sm:text-[30px]">
            أشمن باقة تصلح ليك ولوليداتك؟ 🧡
          </h2>
        </Reveal>

        {/*
         * Two columns, not three — a third track with nothing in it would have
         * pushed the pair off-centre. The narrower cap keeps each card at
         * roughly the 260px it had as one of three, so the cards themselves are
         * the same size as before rather than stretching to fill the old width.
         */}
        <div className="mx-auto mt-7 grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={120 + i * 110}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-wine-950/6 bg-white shadow-[0_1px_3px_rgba(44,6,16,0.05)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(44,6,16,0.11)]">
                <div className="relative aspect-square w-full bg-white">
                  {product.badge && (
                    <span className="absolute start-3 top-3 z-10 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold text-wine-950 shadow-[0_1px_3px_rgba(44,6,16,0.18)]">
                      {product.badge}
                    </span>
                  )}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 640px) 270px, 100vw"
                    quality={90}
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-1 flex-col px-4 pb-4 pt-3 text-center">
                  <h3 className="text-[15px] font-bold text-wine-950">{product.name}</h3>
                  <div className="mt-1.5 text-xs leading-relaxed text-wine-950/55">
                    <p>{product.bundle.lead}</p>
                    <ul className="mt-1 space-y-0.5">
                      {product.bundle.items.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex items-start justify-center gap-1.5"
                        >
                          <span
                            aria-hidden
                            className="mt-[7px] size-1 shrink-0 rounded-full bg-wine-950/30"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-3">
                    {/* dir=ltr keeps "219 DH" in that order — RTL bidi otherwise renders it "DH 219". */}
                    <p
                      dir="ltr"
                      className="text-[17px] font-extrabold tracking-tight text-wine-950"
                    >
                      {priceLabel(product.price)}
                    </p>
                    <OrderButton
                      packId={product.id}
                      className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-wine-800 py-2.5 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-wine-900"
                    >
                      <span>اطلب الآن</span>
                      <CartIcon />
                    </OrderButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
