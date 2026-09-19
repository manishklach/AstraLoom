import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraLoom · Precise astrology workspace",
  description: "Personal astrology charts, question-led consultations, and saved profiles.",
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
    <html lang="en"><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('astraloom-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}"}}/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
