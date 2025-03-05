"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Upload, Copy, Download, MoreVertical, Search, FileJson, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";
import { JSONPath } from "jsonpath-plus";
import Editor from "@monaco-editor/react";

export function JsonEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonPath, setJsonPath] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("請輸入 JSON 文本");
        return;
      }
      const parsed = JSON.parse(input);

      // 處理巢狀 JSON 字串
      const formatted = JSON.stringify(
        parsed,
        (key, value) => {
          if (typeof value === "string") {
            try {
              // 嘗試解析字串是否為 JSON
              const parsedValue = JSON.parse(value);
              if (typeof parsedValue === "object" && parsedValue !== null) {
                // 如果是有效的 JSON 對象，返回解析後的對象
                return parsedValue;
              }
            } catch {
              // 如果解析失敗，表示不是 JSON 字串，直接返回原始值
            }
          }
          if (value !== null && typeof value === "object") {
            // 對對象的鍵進行排序
            return Object.keys(value)
              .sort()
              .reduce(
                (sorted: any, key) => {
                  sorted[key] = value[key];
                  return sorted;
                },
                Array.isArray(value) ? [] : {}
              );
          }
          return value;
        },
        2
      );
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setError("請輸入 JSON 文本");
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setInput(text);
      setError(null);
      try {
        const parsed = JSON.parse(text);
        setOutput(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setError((err as Error).message);
      }
    };
    reader.onerror = () => {
      setError("讀取檔案時發生錯誤");
    };
    reader.readAsText(file);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製到剪貼板");
    } catch (err) {
      toast.error("複製失敗");
    }
  };

  const downloadJson = (content: string, type: "formatted" | "minified") => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `json-${type}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("下載成功");
  };

  const searchJsonPath = useCallback(() => {
    try {
      if (!output || !jsonPath.trim()) {
        setSearchResult("");
        return;
      }
      const parsed = JSON.parse(output);
      const result = JSONPath({ path: jsonPath, json: parsed });
      setSearchResult(JSON.stringify(result, null, 2));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setSearchResult("");
    }
  }, [output, jsonPath]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="overflow-hidden border-2 border-muted">
          <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium">輸入 JSON</h2>
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <Textarea
              placeholder="在此輸入 JSON..."
              className="min-h-[400px] max-h-[600px] font-mono resize-none border-0 focus-visible:ring-0 overflow-y-auto"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="application/json,.json" onChange={handleFileUpload} />
          </div>
          <div className="bg-muted/50 p-3 border-t border-border flex items-center gap-2">
            <Button onClick={formatJson} className="gap-2" variant="secondary">
              <FileJson className="h-4 w-4" />
              格式化
            </Button>
            <Button variant="outline" onClick={minifyJson} className="gap-2">
              <Minimize2 className="h-4 w-4" />
              壓縮
            </Button>
          </div>
        </Card>
        {error && (
          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden border-2 border-muted">
          <div className="bg-muted/50 p-3 border-b border-border">
            <div className="flex gap-2">
              <Input
                placeholder="輸入 JSONPath (例如: $.store.book[0].title)"
                value={jsonPath}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJsonPath(e.target.value)}
                className="h-8"
              />
              <Button variant="secondary" size="sm" onClick={searchJsonPath} className="gap-2">
                <Search className="h-3 w-3" />
                搜尋
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
              {output && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(searchResult || output)}
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
                      <DropdownMenuItem onClick={() => downloadJson(searchResult || output, "formatted")}>
                        <Download className="h-4 w-4 mr-2" />
                        下載格式化檔案
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadJson(JSON.stringify(JSON.parse(searchResult || output)), "minified")}>
                        <Download className="h-4 w-4 mr-2" />
                        下載壓縮檔案
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
            <div className="p-4 h-[400px] relative">
              {output ? (
                <div className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={searchResult || output}
                    theme={theme === "dark" ? "vs-dark" : "light"}
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
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">格式化結果將顯示在這裡...</div>
              )}
            </div>
          </div>
        </Card>
        {searchResult && (
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              查詢結果：
              {Array.isArray(JSON.parse(searchResult)) ? `找到 ${JSON.parse(searchResult).length} 個結果` : "找到 1 個結果"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
