import "@/styles/global.css";
import type { Viewport } from "next";
import FirstVisitSplash from "@/src/components/FirstVisitSplash";
import ViewportOverflowDebug from "@/src/components/ViewportOverflowDebug";

const SPLASH_SEEN_SCRIPT = `(function(){try{if(sessionStorage.getItem("pod-lopuhom-splash-v1")){document.documentElement.classList.add("splash-seen");}}catch(e){}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/products/Logo._pod_lopuhom-removebg-preview.png" type="image/png" />
        <link
          rel="preload"
          as="image"
          href="/images/products/Logo.%20pod_lopuhom.jpeg"
        />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SEEN_SCRIPT }} />
      </head>
      <body className="bg-white text-ink">
        <div
          id="initial-splash"
          className="splash-screen splash-screen--visible"
          role="presentation"
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
            <p className="splash-screen__brand">Pod&nbsp;Lopuhom</p>
            <span className="splash-screen__rule" aria-hidden />
            <p className="splash-screen__tagline">
              Jewellery that carries the beauty of nature
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
