"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// 創建一個初始化的 PostHog 客戶端
const createPostHogClient = () => {
  // 確保只在客戶端執行
  if (typeof window !== "undefined") {
    try {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        person_profiles: "identified_only", // 僅為已識別的用戶創建個人資料
        capture_pageview: false, // 禁用自動頁面查看捕獲，因為我們手動捕獲
        loaded: posthog => {
          if (process.env.NODE_ENV === "development") {
            // 在開發環境中，可以選擇禁用 PostHog
            // posthog.opt_out_capturing();
          }
        },
      });
      return posthog;
    } catch (error) {
      console.error("PostHog 初始化失敗:", error);
      return null;
    }
  }
  return null;
};

// 使用客戶端組件包裝器確保只在客戶端初始化 PostHog
function ClientOnlyPostHog({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<typeof posthog | null>(null);

  useEffect(() => {
    // 在客戶端組件掛載後初始化 PostHog
    setClient(createPostHogClient());
  }, []);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={client}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <ClientOnlyPostHog>{children}</ClientOnlyPostHog>;
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
