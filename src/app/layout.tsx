import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Аура — Найдите своего специалиста по здоровью",
  description: "Платформа для поиска проверенных специалистов в сфере здоровья: нутрициологов, тренеров, психологов и других профессионалов.",
  keywords: ["нутрициолог", "тренер", "психолог", "специалист по здоровью", "консультант"],
  authors: [{ name: "Аура" }],
  openGraph: {
    title: "Аура — Найдите своего специалиста по здоровью",
    description: "Платформа для поиска проверенных специалистов в сфере здоровья",
    type: "website",
    locale: "ru_RU",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}


