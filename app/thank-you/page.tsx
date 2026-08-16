import type { Metadata } from "next";

import ThankYou from "../components/ThankYou";
import TopBar from "../components/TopBar";
import WhatsAppFab from "../components/WhatsAppFab";

export const metadata: Metadata = {
  title: "شكرًا على طلبكم",
  description: "تم تسجيل طلبكم. الدفع عند الاستلام.",
};

export default function ThankYouPage() {
  return (
    <>
      <TopBar />
      <ThankYou />
      {/* Thank-you page only — not mounted anywhere else on the site. */}
      <WhatsAppFab />
    </>
  );
}
