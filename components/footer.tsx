"use client";

import Link from "next/link";
import { Github, Twitter, Mail, Heart, Code, Coffee } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 額外賣點 */}
      <div className="max-w-5xl mx-auto pt-12 pb-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">為什麼選擇我們的 JSON 工具？</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center mb-3">
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
                className="w-5 h-5 mr-2 text-primary"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <h3 className="text-base font-semibold">資料隱私</h3>
            </div>
            <p className="text-xs text-muted-foreground">所有處理在本地進行，確保資料安全</p>
          </div>

          <div className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center mb-3">
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
                className="w-5 h-5 mr-2 text-primary"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3 className="text-base font-semibold">開發友好</h3>
            </div>
            <p className="text-xs text-muted-foreground">支援程式碼高亮與自動完成</p>
          </div>

          <div className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center mb-3">
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
                className="w-5 h-5 mr-2 text-primary"
              >
                <path d="M12 3v18"></path>
                <path d="M5.63 5.64a9 9 0 0 0 0 12.73"></path>
                <path d="M18.37 5.64a9 9 0 0 1 0 12.73"></path>
              </svg>
              <h3 className="text-base font-semibold">離線使用</h3>
            </div>
            <p className="text-xs text-muted-foreground">無需網路連接，隨時隨地使用</p>
          </div>

          <div className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center mb-3">
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
                className="w-5 h-5 mr-2 text-primary"
              >
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <h3 className="text-base font-semibold">高效能</h3>
            </div>
            <p className="text-xs text-muted-foreground">快速處理大型複雜的 JSON 資料</p>
          </div>
        </div>
      </div>

      <div className="border-t"></div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 關於區塊 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">關於 JSON 工具</h3>
            <p className="text-sm text-muted-foreground">我們提供專業的 JSON 格式化、驗證和轉換工具，幫助開發者更高效地處理 JSON 數據。</p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>以</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>打造</span>
            </div>
          </div>

          {/* 功能區塊 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">功能</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  JSON 格式化
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  JSON 驗證
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  巢狀 JSON 解析
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  JSON 轉 CSV
                </Link>
              </li>
            </ul>
          </div>

          {/* 聯絡區塊 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">聯絡我們</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="mailto:contact@example.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 底部版權信息 */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {currentYear} JSON 格式化工具. 保留所有權利.</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              隱私政策
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              使用條款
            </Link>
            <div className="flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              <Link href="#" className="hover:text-foreground transition-colors">
                贊助我們
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
