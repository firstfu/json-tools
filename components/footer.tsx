"use client";

import Link from "next/link";
import { Github, Twitter, Mail, Heart, Code, Coffee } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
