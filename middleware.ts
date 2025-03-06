import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./app/i18n/settings";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 檢查路徑是否已包含語言代碼
  const pathnameIsMissingLocale = i18n.locales.every(locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`);

  console.log("=================1===================");
  console.log("pathname", pathname);
  console.log("pathnameIsMissingLocale", pathnameIsMissingLocale);
  console.log("=================1===================");

  if (pathnameIsMissingLocale) {
    // 從 cookie 或 accept-language 取得偏好語言
    const locale = request.cookies.get("NEXT_LOCALE")?.value || request.headers.get("accept-language")?.split(",")[0].split("-")[0] || i18n.defaultLocale;

    console.log("=================2===================");
    console.log("pathname", pathname);
    console.log("pathnameIsMissingLocale", pathnameIsMissingLocale);
    console.log("=================2===================");

    // 重導向到包含語言代碼的路徑
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
