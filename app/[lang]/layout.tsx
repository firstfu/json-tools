import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { i18n } from "../i18n/settings";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { translate } from "../i18n/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";
import { PostHogProvider } from "../providers";
import { GoogleAnalytics } from "../ga-provider";

const inter = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  return {
    title: translate("進階 JSON 格式化工具", lang as "en" | "zh-TW"),
    description: translate("支援巢狀 JSON 字串的智慧格式化工具", lang as "en" | "zh-TW"),
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="您的 Google Search Console 驗證碼" />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <PostHogProvider key="posthog-provider">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange storageKey="json-tools-theme">
            <div className="min-h-screen bg-background">
              <header className="p-4 border-b flex justify-between items-center">
                <LanguageSwitcher />
                <ThemeToggle />
              </header>
              {children}
            </div>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
