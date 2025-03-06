import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { i18n } from "../i18n/settings";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { translate } from "../i18n/utils";

const inter = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: translate("進階 JSON 格式化工具", lang as "en" | "zh-TW"),
    description: translate("支援巢狀 JSON 字串的智慧格式化工具", lang as "en" | "zh-TW"),
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <header className="p-4 border-b">
          <LanguageSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
