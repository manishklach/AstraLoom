import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraLoom · Precise astrology workspace",
  description: "Birth charts, Placidus cusps and saved astrology profiles.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
