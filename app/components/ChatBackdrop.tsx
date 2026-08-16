/*
 * Decorative backdrop for the voice testimonials: chat bubbles, ticks and
 * waveforms drifting slowly behind the cards.
 *
 * Positions and timings come from a seeded generator rather than Math.random,
 * so the server and the client render the exact same layer and React does not
 * report a hydration mismatch.
 */

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

type Glyph = "bubble" | "chat" | "tick" | "wave";
const GLYPHS: Glyph[] = ["bubble", "chat", "tick", "wave"];

/*
 * Only tones this section already paints: slate-500 (duration text), blue-500
 * (waveform progress), green-600 (verified badge), amber-400 (stars).
 */
const TONES = ["text-slate-500", "text-blue-500", "text-green-600", "text-amber-400"];

const TOTAL = 20;
/** The first eight stay on phones; the rest appear from md up. */
const MOBILE_COUNT = 8;

const particles = (() => {
  const random = seeded(20250815);
  return Array.from({ length: TOTAL }, (_, index) => {
    const horizontal = random() > 0.62; // a few drift sideways instead of rising
    return {
      glyph: GLYPHS[Math.floor(random() * GLYPHS.length)],
      tone: TONES[Math.floor(random() * TONES.length)],
      left: Math.round(random() * 94) + 2,
      top: Math.round(random() * 88) + 4,
      size: Math.round(16 + random() * 20),
      dx: Math.round((random() * 2 - 1) * (horizontal ? 150 : 44)),
      dy: Math.round(horizontal ? (random() * 2 - 1) * 40 : -(90 + random() * 130)),
      rot: Math.round((random() * 2 - 1) * 14),
      duration: Math.round(26 + random() * 26),
      delay: Math.round(random() * 22),
      opacity: Math.round((0.05 + random() * 0.06) * 100) / 100,
    };
  });
})();

function GlyphShape({ kind }: { kind: Glyph }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "bubble":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="size-full">
          <path {...common} d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="size-full">
          <path {...common} d="M3 6.2A2.2 2.2 0 0 1 5.2 4h9.6A2.2 2.2 0 0 1 17 6.2v5.6A2.2 2.2 0 0 1 14.8 14H8l-3.6 2.8V14h-.2A2.2 2.2 0 0 1 3 11.8z" />
          <path {...common} d="M19 9.5h.3A1.7 1.7 0 0 1 21 11.2v5.3a1.7 1.7 0 0 1-1.7 1.7H19l-2.6 2.3V18" />
        </svg>
      );
    case "tick":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="size-full">
          <path {...common} d="M2 13l4.2 4.2L13 8.5" />
          <path {...common} d="M10.5 15.2L12.8 17.4 21 7.6" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="size-full">
          <path {...common} d="M3 11v2M6.5 8.5v7M10 5.5v13M13.5 9v6M17 7v10M20.5 10.5v3" />
        </svg>
      );
  }
}

export default function ChatBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          style={
            {
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              "--chat-dx": `${particle.dx}px`,
              "--chat-dy": `${particle.dy}px`,
              "--chat-rot": `${particle.rot}deg`,
              "--chat-duration": `${particle.duration}s`,
              "--chat-delay": `-${particle.delay}s`,
              "--chat-opacity": particle.opacity,
            } as React.CSSProperties
          }
          className={`chat-particle absolute ${particle.tone} ${
            index >= MOBILE_COUNT ? "hidden md:block" : "block"
          }`}
        >
          <GlyphShape kind={particle.glyph} />
        </span>
      ))}
    </div>
  );
}
