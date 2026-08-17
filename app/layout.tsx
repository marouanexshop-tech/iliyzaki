import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

import MetaPixel from "./components/MetaPixel";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "JOUD SOUS",
  description: "منتجات مغربية طبيعية 100%، مرخصة من طرف ONSSA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* In the layout, so PageView fires on every route including /thank-you. */}
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
