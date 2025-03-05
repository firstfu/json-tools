"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Rocket, Zap, Sparkles } from "lucide-react";

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
  return (
    <div className="relative overflow-hidden bg-background pt-16 pb-12">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            進階 JSON 格式化工具
          </h1>
          <p className="text-2xl text-muted-foreground">支援巢狀 JSON 字串的智慧格式化工具</p>
          <p className="text-xl text-muted-foreground">輕鬆處理多層 JSON 字串，自動識別並格式化巢狀結構</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-6 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-4">
                  <Rocket className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">巢狀 JSON 支援</h3>
                <p className="text-base text-muted-foreground">自動識別並格式化字串中的 JSON，支援多層巢狀結構</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-6 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-4">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">智慧解析</h3>
                <p className="text-base text-muted-foreground">自動檢測並修復常見的 JSON 格式問題</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 opacity-20 group-hover:opacity-40 transition duration-200" />
              <div className="relative p-6 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">一鍵轉換</h3>
                <p className="text-base text-muted-foreground">快速轉換所有層級的 JSON 字串</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="rounded-lg bg-muted/50 dark:bg-gray-900/50 p-4 backdrop-blur">
              <p className="text-base font-mono mb-2">👉 輕鬆處理多層巢狀的 JSON 字串，例如：</p>
              <div className="bg-background dark:bg-gray-900/90 rounded p-3 text-sm font-mono overflow-x-auto">
                <p className="text-muted-foreground">輸入：</p>
                <p>{INPUT_EXAMPLE}</p>
                <p className="text-muted-foreground mt-2">格式化後：</p>
                <p>{OUTPUT_EXAMPLE}</p>
              </div>
            </div>
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
