/* ---------------------------------------------------------------------------
 * Meta Pixel events.
 *
 * The inline snippet in MetaPixel defines fbq and its queue before
 * fbevents.js arrives, so a call made early is queued and replayed rather than
 * lost. The optional call below is the guard for the window before that
 * snippet runs at all — a dropped analytics event must never break checkout.
 * ------------------------------------------------------------------------- */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type PixelParams = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
};

export function track(event: string, params?: PixelParams) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params);
  } catch {
    // Ad blockers stub fbq in ways that can throw. Never surface it.
  }
}
