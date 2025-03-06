"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Copy, Download, MoreVertical, Search, History, ChevronUp, ChevronDown, FileText } from "lucide-react";
import type { TranslationKey } from "@/app/i18n/utils";
import type { EditorOnMount } from "./types";
import { jsonToCSV } from "./utils";

interface JsonOutputProps {
  output: string;
  searchText: string;
  setSearchText: (value: string) => void;
  matchCase: boolean;
  setMatchCase: (value: boolean) => void;
  matchWholeWord: boolean;
  setMatchWholeWord: (value: boolean) => void;
  currentMatchIndex: number;
  totalMatches: number;
  handleSearch: () => void;
  navigateMatch: (direction: "next" | "prev") => void;
  addToHistory: () => boolean;
  handleEditorDidMount: EditorOnMount;
  t: (key: TranslationKey) => string;
}

export function JsonOutput({
  output,
  searchText,
  setSearchText,
  matchCase,
  setMatchCase,
  matchWholeWord,
  setMatchWholeWord,
  currentMatchIndex,
  totalMatches,
  handleSearch,
  navigateMatch,
  addToHistory,
  handleEditorDidMount,
  t,
}: JsonOutputProps) {
  const { theme } = useTheme();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("已複製到剪貼板"));
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error(t("複製失敗"));
    }
  };

  const downloadJson = useCallback(
    (content: string, type: "formatted" | "minified") => {
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `json-${type}-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("下載成功"));
    },
    [t]
  );

  return (
    <div className="flex flex-col md:w-1/2">
      <Card className="overflow-hidden border-2 border-muted flex flex-col flex-grow min-h-[calc(600px+6rem)]">
        <div className="bg-muted/50 p-3 border-b border-border">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder={t("輸入要搜尋的文字...")}
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) {
                      navigateMatch("prev");
                    } else {
                      if (totalMatches === 0) {
                        handleSearch();
                      } else {
                        navigateMatch("next");
                      }
                    }
                  }
                }}
                className="h-8"
              />
              <div className="flex items-center gap-1">
                {totalMatches > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigateMatch("prev")} className="h-8 px-2">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateMatch("next")} className="h-8 px-2">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {currentMatchIndex}/{totalMatches}
                    </span>
                  </>
                )}
                <Button variant="secondary" size="sm" onClick={handleSearch} className="gap-2">
                  <Search className="h-3 w-3" />
                  {t("搜尋")}
                </Button>
              </div>
              {output && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (addToHistory()) {
                        toast.success(t("已添加到歷史記錄"));
                      }
                    }}
                    className="gap-2"
                  >
                    <History className="h-3 w-3" />
                    {t("保存")}
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="h-4 w-4 rounded border-muted" />
                {t("區分大小寫")}
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={matchWholeWord} onChange={e => setMatchWholeWord(e.target.checked)} className="h-4 w-4 rounded border-muted" />
                {t("全字匹配")}
              </label>
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
            {output && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(output)}
                  className="h-8 w-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => downloadJson(output, "formatted")}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("下載格式化檔案")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadJson(JSON.stringify(JSON.parse(output)), "minified")}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("下載壓縮檔案")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          const jsonData = JSON.parse(output);
                          const csv = jsonToCSV(jsonData);
                          const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `json-to-csv-${new Date().getTime()}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success(t("CSV 下載成功"));
                        } catch (error) {
                          console.error("Error converting to CSV:", error);
                          toast.error(error instanceof Error ? error.message : t("轉換 CSV 時發生錯誤"));
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {t("下載為 CSV")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          <div className="h-full flex flex-col">
            {output ? (
              <MonacoEditor
                height="600px"
                defaultLanguage="json"
                value={output}
                theme={theme === "dark" ? "vs-dark" : "light"}
                className="min-h-[600px] flex-grow"
                onMount={handleEditorDidMount}
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  folding: true,
                  foldingHighlight: true,
                  foldingStrategy: "auto",
                  showFoldingControls: "always",
                  matchBrackets: "always",
                  automaticLayout: true,
                  formatOnPaste: true,
                  scrollBeyondLastLine: false,
                  find: {
                    addExtraSpaceOnTop: false,
                    seedSearchStringFromSelection: "never",
                    cursorMoveOnType: false,
                    autoFindInSelection: "never",
                  },
                  // 添加自定義 CSS 類別
                  extraEditorClassName: "custom-find-match",
                }}
              />
            ) : (
              <div className="h-[600px] w-full flex items-center justify-center bg-muted/20 font-mono text-muted-foreground text-sm flex-grow">
                {t("格式化結果將顯示在這裡...")}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
