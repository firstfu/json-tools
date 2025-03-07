"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// 在元件外部先初始化 PostHog 客戶端
if (typeof window !== "undefined") {
  console.log("======================================");
  console.log("process.env.NEXT_PUBLIC_POSTHOG_KEY:", process.env.NEXT_PUBLIC_POSTHOG_KEY);
  console.log("process.env.NEXT_PUBLIC_POSTHOG_HOST:", process.env.NEXT_PUBLIC_POSTHOG_HOST);
  console.log("======================================");

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only", // 僅為已識別的用戶創建個人資料
    capture_pageview: false, // 禁用自動頁面查看捕獲，因為我們手動捕獲
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // 追蹤頁面瀏覽
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      console.log("url", url);
      console.log("searchParams", searchParams);

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

// 將 PostHogPageView 包裝在 Suspense 中，以避免上面的 useSearchParams 使用
// 導致整個應用程序切換到客戶端渲染
// 參見: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
