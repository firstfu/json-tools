"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Rocket, Zap, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "@/app/i18n/utils";

const INPUT_EXAMPLE = '{"data": "{\\"user\\": {\\"info\\": {\\"name\\": \\"John\\", \\"age\\": 30}}}"}';
const OUTPUT_EXAMPLE = `{
  "data": {
    "user": {
      "info": {
        "name": "John",
        "age": 30
      }
    }
  }
}`;

export function Header() {
  const params = useParams();
  const { t } = useTranslations(params.lang as "en" | "zh-TW");

  return (
    <div className="relative overflow-hidden bg-background pt-16 pb-12">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        <div className="text-center space-y-6 max-w-5xl mx-auto pt-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {t("進階 JSON 格式化工具")}
          </h1>
          <p className="text-2xl text-muted-foreground">{t("支援巢狀 JSON 字串的智慧格式化工具")}</p>
          <p className="text-xl text-muted-foreground">{t("輕鬆處理多層 JSON 字串，自動識別並格式化巢狀結構")}</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-4 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("巢狀 JSON 支援")}</h3>
                <p className="text-sm text-muted-foreground">{t("自動識別並格式化多層巢狀結構")}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-4 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("智慧解析")}</h3>
                <p className="text-sm text-muted-foreground">{t("自動檢測並修復常見格式問題")}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-4 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("一鍵轉換")}</h3>
                <p className="text-sm text-muted-foreground">{t("快速轉換所有層級的 JSON 字串")}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-4 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <line x1="9" y1="10" x2="15" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("智能搜尋")}</h3>
                <p className="text-sm text-muted-foreground">{t("快速搜尋並高亮顯示匹配結果")}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-4 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("資料隱私")}</h3>
                <p className="text-sm text-muted-foreground">{t("所有處理在本地完成，確保資料安全")}</p>
              </div>
            </div>
          </div>

          {/* 呼叫行動區塊 */}
          <div className="pt-6">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-lg">
              <div className="bg-background/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-3">{t("立即體驗最強大的 JSON 處理工具")}</h2>
                <p className="text-base text-muted-foreground mb-4">{t("無需註冊，免費使用所有功能")}</p>
                <button
                  onClick={() => document.getElementById("json-editor-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t("開始使用")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="rounded-lg bg-muted/50 dark:bg-gray-900/50 p-4 backdrop-blur">
          <p className="text-base font-mono mb-2">👉 {t("輕鬆處理多層 JSON 字串，自動識別並格式化巢狀結構")}</p>
          <div className="bg-background dark:bg-gray-900/90 rounded p-3 text-sm font-mono overflow-x-auto">
            <p className="text-muted-foreground">{t("輸入")}：</p>
            <p>{INPUT_EXAMPLE}</p>
            <p className="text-muted-foreground mt-2">{t("格式化")}：</p>
            <p>{OUTPUT_EXAMPLE}</p>
          </div>
        </div>
      </div>

      {/* 背景裝飾 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[50%] top-0 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
          <div
            className="aspect-[1120/678] w-[70rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-[0.15] dark:opacity-[0.05]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
