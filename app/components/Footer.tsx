import Image from "next/image";

/* ---------------------------------------------------------------------------
 * Fill these in and the matching rows/icons appear automatically.
 * Anything left as "" is simply not rendered — no dead links, no placeholders.
 * ------------------------------------------------------------------------- */
const contact = {
  phone: "", // e.g. "0612345678"
  email: "", // e.g. "contact@amlo.ma"
  address: "", // e.g. "أكادير، المغرب"
};

const social = {
  instagram: "", // e.g. "https://instagram.com/..."
  facebook: "",
  tiktok: "",
  whatsapp: "", // e.g. "https://wa.me/212612345678"
};

const socialPaths: Record<keyof typeof social, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.83.91 1.4.17.42.37 1.05.42 2.24.06 1.28.07 1.67.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2-.22.6-.48 1-.9 1.4-.42.43-.83.7-1.4.91-.42.17-1.05.37-2.24.42-1.28.06-1.67.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42-.6-.22-1-.48-1.4-.9-.43-.42-.7-.83-.91-1.4-.17-.42-.37-1.05-.42-2.24C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.42-.43.83-.7 1.4-.91.42-.17 1.05-.37 2.24-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.76 6.76 0 0 0 12 5.25zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38zm6.99-11.4a1.58 1.58 0 1 1-1.58-1.58 1.58 1.58 0 0 1 1.58 1.58z",
  facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.93 8.44-9.94z",
  tiktok:
    "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.85-2.48V9.77a5.7 5.7 0 1 0 4.94 5.64V9.42a7.32 7.32 0 0 0 4.28 1.37V7.7a4.28 4.28 0 0 1-3.22-1.88z",
  whatsapp:
    "M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.13 15.06l-.3-.18-3.08.89.9-3-.19-.31A8.1 8.1 0 0 1 12.04 3.8zm4.6 10.24c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12s-.63.8-.77.96c-.14.17-.28.19-.53.06a6.66 6.66 0 0 1-1.95-1.2 7.32 7.32 0 0 1-1.35-1.68c-.14-.25 0-.38.11-.5.11-.12.25-.28.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03 4.74 4.74 0 0 0 1 2.51 10.86 10.86 0 0 0 4.16 3.67c.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z",
};

const socialLabels: Record<keyof typeof social, string> = {
  instagram: "إنستغرام",
  facebook: "فيسبوك",
  tiktok: "تيك توك",
  whatsapp: "واتساب",
};

export default function Footer() {
  const contactRows = [
    contact.phone && { key: "phone", value: contact.phone, href: `tel:${contact.phone}`, ltr: true },
    contact.email && { key: "email", value: contact.email, href: `mailto:${contact.email}`, ltr: true },
    contact.address && { key: "address", value: contact.address, href: null, ltr: false },
  ].filter(Boolean) as { key: string; value: string; href: string | null; ltr: boolean }[];

  const socialEntries = (Object.keys(social) as (keyof typeof social)[]).filter((k) => social[k]);

  return (
    <footer className="relative isolate overflow-hidden bg-wine-950 text-white">
      {/*
       * Background photo. bg-cover never distorts it; the 68% vertical anchor
       * shifts the framing down so the top of the shot is cropped away.
       * If the file is absent this layer is simply invisible — no broken image.
       */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('/footer/footer-bg.jpg')] bg-cover bg-[center_68%] bg-no-repeat"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-wine-950/82 via-wine-950/88 to-wine-950/93"
      />

      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-7">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:justify-between md:gap-8 md:text-start">
          <div>
            {/*
             * The brown field is keyed out of the file, so the gold ring reads
             * straight against the wine backdrop with nothing to clip. Sits
             * exactly where the "AMLO" wordmark did — centred on phones,
             * start-aligned from md — so the column's alignment and the mt-1.5
             * below are untouched.
             */}
            <Image
              src="/brand/logo.webp"
              alt="ELLY ZAKI"
              width={1080}
              height={1080}
              className="mx-auto size-12 md:mx-0 md:size-14"
            />
            <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-white/60">
              منتجات مغربية طبيعية 100% — أملو، عسل ومكسرات مختارة بعناية، محضّرة بمكونات أصيلة
              وموثوقة.
            </p>
          </div>

          {/* ONSSA is the footer's trust anchor, so it gets the most weight here. */}
          <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 ring-inset">
              <Image
                src="/onssa.webp"
                alt="ONSSA"
                width={150}
                height={75}
                className="h-9 w-auto md:h-11"
              />
              <span className="text-[12px] font-bold leading-tight text-white/80">
                مرخصة من طرف
                <br />
                ONSSA
              </span>
            </span>

            <ul className="space-y-1 text-[12.5px] text-white/60">
              {contactRows.map((row) => (
                <li key={row.key}>
                  {row.href ? (
                    <a
                      href={row.href}
                      dir={row.ltr ? "ltr" : undefined}
                      className="transition-colors duration-200 hover:text-gold-400"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span>{row.value}</span>
                  )}
                </li>
              ))}
              <li>توصيل مجاني لجميع مدن المغرب</li>
              <li>الدفع عند الاستلام</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 border-t border-white/10 pt-4 sm:flex-row-reverse sm:justify-between">
          {socialEntries.length > 0 && (
            <ul className="flex items-center gap-2.5">
              {socialEntries.map((key) => (
                <li key={key}>
                  <a
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabels[key]}
                    className="grid size-9 place-items-center rounded-full ring-1 ring-white/15 ring-inset transition-colors duration-200 hover:bg-white/10 hover:ring-gold-400/40"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
                      <path d={socialPaths[key]} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[12px] text-white/60">
            © {new Date().getFullYear()} AMLO — جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
