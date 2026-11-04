import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Saber — Senior Software Engineer & Team Lead",
  description: "Senior Software Engineer and Team Lead building scalable platforms across logistics, fintech, ERP, and security.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
