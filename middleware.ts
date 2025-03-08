import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./app/i18n/settings";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 排除 sitemap 相關的路徑
  if (pathname.includes("sitemap") || pathname.includes("robots.txt")) {
    return NextResponse.next();
  }

  // 檢查路徑是否已包含完整的語言代碼
  const pathnameHasLocale = i18n.locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  //   console.log("pathnameHasLocale", pathnameHasLocale);

  if (!pathnameHasLocale) {
    // 優先使用瀏覽器語系
    const acceptLanguage = request.headers.get("accept-language");
    let locale;

    if (acceptLanguage) {
      // 檢查是否包含繁體中文
      const hasTraditionalChinese = acceptLanguage.toLowerCase().includes("zh-tw");
      if (hasTraditionalChinese) {
        locale = "zh-TW";
      } else {
        // 非繁中用戶導向英文版
        locale = "en";
      }
    }

    // 如果沒有偵測到瀏覽器語系，才使用 cookie
    if (!locale) {
      locale = request.cookies.get("NEXT_LOCALE")?.value;
    }

    // 如果沒有找到匹配的語言或非繁中，使用英文
    if (!locale || (locale !== "zh-TW" && locale !== "en")) {
      locale = "en";
    }

    // 重導向到包含語言代碼的路徑
    const newUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)"],
};
