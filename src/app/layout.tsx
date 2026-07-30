import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Granny May's Ledger", description: "test" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-parchment text-ink">{children}</body>
    </html>
  );
}
