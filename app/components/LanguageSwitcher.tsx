"use client";

import { useRouter, usePathname } from "next/navigation";
import { i18n } from "../i18n/settings";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    // 從當前路徑中移除語言代碼
    const currentPathWithoutLocale = pathname.split("/").slice(2).join("/");
    // 導向新的語言路徑
    router.push(`/${locale}/${currentPathWithoutLocale}`);
  };

  return (
    <div className="flex gap-2">
      {i18n.locales.map(locale => {
        const isCurrentLocale = pathname.startsWith(`/${locale}`);
        return (
          <Button key={locale} onClick={() => switchLanguage(locale)} variant={isCurrentLocale ? "default" : "outline"} size="sm" className="min-w-[90px]">
            {locale === "en" ? "English" : "繁體中文"}
          </Button>
        );
      })}
    </div>
  );
}
