import "@/styles/global.css";
import type { Viewport } from "next";
import { Caveat, Reenie_Beanie } from "next/font/google";
import FirstVisitSplash from "@/src/components/FirstVisitSplash";
import ViewportOverflowDebug from "@/src/components/ViewportOverflowDebug";

const reenieBeanie = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tagline",
  display: "swap",
});

/** Reenie Beanie has no Cyrillic; Caveat covers RU with a similar handwritten feel. */
const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-tagline-cyrillic",
  display: "swap",
});

export const metadata = {
  title: "Pod Lopuhom",
  description: "Handmade jewelry",
  icons: {
    icon: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
    shortcut: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
    apple: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${reenieBeanie.variable} ${caveat.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <link rel="icon" href="/images/products/Logo._pod_lopuhom-removebg-preview.png" type="image/png" />
        <link
          rel="preload"
          as="image"
          href="/images/products/Logo.%20pod_lopuhom.jpeg"
        />
      </head>
      <body className="bg-white text-ink" suppressHydrationWarning>
        <div
          id="initial-splash"
          className="splash-screen"
          role="presentation"
          aria-hidden="true"
        >
          <div className="splash-screen__glow" aria-hidden />
          <div className="splash-screen__inner">
            <div className="splash-screen__logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt=""
                width={112}
                height={112}
                className="splash-screen__logo"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <p className="splash-screen__brand font-brand">Pod&nbsp;Lopuhom</p>
            <span className="splash-screen__rule" aria-hidden />
            <p className="splash-screen__tagline font-tagline">
              Handcrafted resin creations inspired by nature
            </p>
          </div>
        </div>
        <div id="site-root">
          <FirstVisitSplash />
          {children}
        </div>
        {process.env.NODE_ENV === "development" ? <ViewportOverflowDebug /> : null}
      </body>
    </html>
  );
}
