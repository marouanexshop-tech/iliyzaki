import Script from "next/script";

/*
 * Meta Pixel. The id is not a secret — it ships in the page source for every
 * visitor either way — so NEXT_PUBLIC_ is correct here, and the fallback keeps
 * the pixel firing without any environment setup.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "945486244153576";

export default function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      {/*
       * afterInteractive, not beforeInteractive: the pixel is analytics, and
       * loading it ahead of hydration would put Facebook's script in front of
       * the page the customer is trying to read. It still fires on the first
       * paint for tracking purposes.
       *
       * The snippet is inline so fbq() and its queue exist immediately — any
       * later fbq('track', …) call pushes onto that queue and is replayed once
       * fbevents.js lands, so no event is lost to a race.
       */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>

      {/* Fallback for visitors with JavaScript disabled. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
