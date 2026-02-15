import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GREVA CRM",
  description: "Founder-controlled CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
