"use client";

import { Header } from "@/components/header";
import { JsonEditor } from "@/components/jsoneditor";
import { Footer } from "@/components/footer";
import { useEffect } from "react";
import { captureEvent } from "@/lib/posthog";

export default function Home() {
  useEffect(() => {
    // 示範：在頁面載入時發送一個自定義事件
    captureEvent("home_page_viewed", {
      source: "direct_navigation",
      timestamp: new Date().toISOString(),
    });
  }, []);

  // 示範：點擊按鈕時發送事件的處理函數
  const handleExampleClick = () => {
    captureEvent("example_button_clicked", {
      location: "home_page",
      interaction_type: "button_click",
    });
    // 實際的按鈕點擊處理邏輯...
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <JsonEditor />
      </main>
      <Footer />
    </div>
  );
}
