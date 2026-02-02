import "../styles/global.css";

export const metadata = {
  title: "Pod Lopuhom",
  description: "Handmade jewelry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-ink">{children}</body>
    </html>
  );
}
