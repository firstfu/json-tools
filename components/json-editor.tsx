"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Copy, Download, MoreVertical, Search, FileJson, Minimize2, History, X, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";
import { JSONPath } from "jsonpath-plus";
import Editor from "@monaco-editor/react";

interface HistoryItem {
  id: string;
  content: string;
  timestamp: Date;
  name: string;
}

export function JsonEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonPath, setJsonPath] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
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

  const addToHistory = useCallback(() => {
    if (!output) return;

    if (history.length >= 6) {
      toast.error("已達到最大歷史記錄數量（6個）");
      return;
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      content: output,
      timestamp: new Date(),
      name: `JSON ${history.length + 1}`,
    };

    setHistory(prev => [newItem, ...prev]);
    toast.success("已添加到歷史記錄");
  }, [output, history]);

  const updateHistoryName = useCallback((id: string, newName: string) => {
    setHistory(prev => prev.map(item => (item.id === id ? { ...item, name: newName } : item)));
    setEditingName(null);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const loadFromHistory = useCallback((content: string) => {
    setInput(content);
  }, []);

  return (
    <div className="space-y-6">
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map(item => (
            <Card key={item.id} className="relative overflow-hidden border border-muted group">
              <div className="absolute right-2 top-2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedItem(item)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => loadFromHistory(item.content)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFromHistory(item.id)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-2 border-b border-border flex items-center justify-between">
                {editingName === item.id ? (
                  <Input
                    className="h-6 text-sm"
                    defaultValue={item.name}
                    autoFocus
                    onBlur={e => updateHistoryName(item.id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        updateHistoryName(item.id, e.currentTarget.value);
                      } else if (e.key === "Escape") {
                        setEditingName(null);
                      }
                    }}
                  />
                ) : (
                  <h3 className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => setEditingName(item.id)}>
                    {item.name}
                  </h3>
                )}
              </div>
              <div className="h-[300px] overflow-y-auto p-3">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={item.content}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    folding: true,
                    lineNumbers: "off",
                    renderLineHighlight: "none",
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
              <div className="bg-muted/50 p-2 text-xs text-muted-foreground border-t border-border">保存時間：{item.timestamp.toLocaleString()}</div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name || "JSON 內容"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {selectedItem && (
              <Editor
                height="calc(80vh - 80px)"
                defaultLanguage="json"
                value={selectedItem.content}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  folding: true,
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="overflow-hidden border-2 border-muted flex flex-col">
            <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium">輸入 JSON</h2>
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="在此輸入 JSON..."
                className="h-full w-full font-mono resize-none border-0 focus-visible:ring-0 overflow-y-auto max-h-[600px]"
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
          <Card className="overflow-hidden border-2 border-muted flex flex-col">
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
                {output && (
                  <Button variant="outline" size="sm" onClick={addToHistory} className="gap-2">
                    <History className="h-3 w-3" />
                    保存
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
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
              <div className="h-full">
                {output ? (
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={searchResult || output}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    className="min-h-[400px] max-h-[600px] overflow-y-auto"
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">格式化結果將顯示在這裡...</div>
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
    </div>
  );
}
