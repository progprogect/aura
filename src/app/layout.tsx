import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalNavigation } from "@/components/ConditionalNavigation";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Предотвращает авто-зум на iOS при фокусе инпута
}

export const metadata: Metadata = {
  title: "Эволюция 360 — Все для вашего развития и здоровья",
  description: "Сервис, где можно найти специалистов и программы для полноценного развития: психологи, тренеры, нутрициологи, коучи и другие эксперты.",
  keywords: ["развитие", "здоровье", "нутрициолог", "тренер", "психолог", "эксперт", "консультант"],
  authors: [{ name: "Эволюция 360" }],
  openGraph: {
    title: "Эволюция 360 — Все для вашего развития и здоровья",
    description: "Подберите специалистов и решения для комплексного развития и баланса жизни",
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
        <ConditionalNavigation />
        {children}
      </body>
    </html>
  );
}


