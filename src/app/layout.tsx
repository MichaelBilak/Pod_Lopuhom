import "@/styles/global.css";
import type { Viewport } from "next";
import { Caveat } from "next/font/google";
import FirstVisitSplash from "@/src/components/FirstVisitSplash";
import ViewportOverflowDebug from "@/src/components/ViewportOverflowDebug";
import { SPLASH_STORAGE_KEY } from "@/src/lib/splash";

/** Handwritten tagline — Latin + Cyrillic (EN / RU / IT hero). */
const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-tagline",
  display: "swap",
});

const SPLASH_LOGO_SRC =
  "/images/products/Logo._pod_lopuhom-removebg-preview.png";

/** Runs before first paint so returning visits never flash the splash, and first visits cover the site immediately. */
const SPLASH_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(SPLASH_STORAGE_KEY)};var skip=sessionStorage.getItem(k)||window.matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.classList.add(skip?"splash-skip":"splash-active");}catch(e){document.documentElement.classList.add("splash-skip");}})();`;

const SPLASH_CRITICAL_CSS = `html.splash-active{overflow:hidden}html.splash-skip #initial-splash{display:none!important}#initial-splash{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:linear-gradient(165deg,#fff 0%,#f8fafc 42%,#f1f5f9 100%)}`;

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
    <html lang="en" suppressHydrationWarning className={caveat.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <link rel="icon" href="/images/products/Logo._pod_lopuhom-removebg-preview.png" type="image/png" />
        <link
          rel="preload"
          as="image"
          href={SPLASH_LOGO_SRC}
        />
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CRITICAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOT_SCRIPT }} />
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
                src={SPLASH_LOGO_SRC}
                alt=""
                width={128}
                height={128}
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
