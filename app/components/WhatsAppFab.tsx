/* ---------------------------------------------------------------------------
 * The shop's WhatsApp number, digits only, with the country code and no "+"
 * — e.g. "212612345678" for 0612345678.
 *
 * Either set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local, or type the number
 * straight into the fallback below. Punctuation is stripped, so "+212 612-345-678"
 * works just as well as the bare digits.
 *
 * Until one of the two is filled in the button still renders — it just opens
 * WhatsApp's own page instead of a chat, so it can never land a customer in a
 * conversation with a stranger's number.
 * ------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/** Pre-filled first message. Leave empty to open a blank chat. */
const PREFILL = "السلام عليكم، عندي سؤال على الطلبية ديالي.";

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-7 md:size-[30px]">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.13 15.06l-.3-.18-3.08.89.9-3-.19-.31A8.1 8.1 0 0 1 12.04 3.8zm4.6 10.24c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12s-.63.8-.77.96c-.14.17-.28.19-.53.06a6.66 6.66 0 0 1-1.95-1.2 7.32 7.32 0 0 1-1.35-1.68c-.14-.25 0-.38.11-.5.11-.12.25-.28.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03 4.74 4.74 0 0 0 1 2.51 10.86 10.86 0 0 0 4.16 3.67c.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
    </svg>
  );
}

export default function WhatsAppFab() {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  const href = digits
    ? `https://wa.me/${digits}${PREFILL ? `?text=${encodeURIComponent(PREFILL)}` : ""}`
    : "https://wa.me/";

  return (
    <>
      {/*
       * Clearance the button provides for itself. On phones the page content
       * runs full width, so without this the disc sits on top of the "back to
       * home" link once you reach the end of the page. Kept here rather than in
       * ThankYou so the page itself stays untouched.
       */}
      <div aria-hidden className="h-24 md:hidden" />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        /*
         * isolate keeps the halo's -z-10 pseudo-element above the page
         * background rather than behind it. z-[999] clears every other layer on
         * the site — the top bar sits at z-50 — so the disc can never end up
         * behind a section.
         */
        className="whatsapp-fab fixed bottom-5 start-5 z-[999] grid size-14 place-items-center rounded-full text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95 md:size-[60px]"
        style={{ backgroundColor: "#25D366", isolation: "isolate" }}
      >
        <WhatsAppGlyph />
      </a>
    </>
  );
}
