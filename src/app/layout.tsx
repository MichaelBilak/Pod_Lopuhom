import "@/styles/global.css";
import ViewportOverflowDebug from "@/src/components/ViewportOverflowDebug";

export const metadata = {
  title: "Pod Lopuhom",
  description: "Handmade jewelry",
  icons: {
    icon: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
    shortcut: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
    apple: "/images/products/Logo._pod_lopuhom-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/products/Logo._pod_lopuhom-removebg-preview.png" type="image/png" />
      </head>
      <body className="bg-white text-ink">
        {children}
        {process.env.NODE_ENV === "development" ? <ViewportOverflowDebug /> : null}
      </body>
    </html>
  );
}
