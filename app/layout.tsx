import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinGraph",
  description: "Personal macro-financial intelligence dashboard and Skill Pack exporter.",
  icons: {
    icon: [{ url: "/fingraph-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/fingraph-icon.svg"],
    apple: [{ url: "/fingraph-icon.svg" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <body>
        <Script
          id="fingraph-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('fingraph-theme')||'dark';document.documentElement.dataset.theme=t;}catch(e){}"
          }}
        />
        {children}
      </body>
    </html>
  );
}
