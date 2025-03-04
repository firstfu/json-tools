"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Upload, Copy, Download, MoreVertical, Search } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { JSONPath } from "jsonpath-plus";

export function JsonEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonPath, setJsonPath] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setError("請輸入 JSON 文本");
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const minifyJson = () => {
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setInput(text);
      setError(null);
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

  const searchJsonPath = () => {
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
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="在此輸入 JSON..."
            className="min-h-[400px] font-mono"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="application/json,.json" onChange={handleFileUpload} />
        </div>
        <div className="flex gap-2">
          <Button onClick={formatJson}>格式化</Button>
          <Button variant="outline" onClick={minifyJson}>
            壓縮
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </Card>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex gap-2 mb-4">
            <Input placeholder="輸入 JSONPath (例如: $.store.book[0].title)" value={jsonPath} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJsonPath(e.target.value)} />
            <Button variant="outline" size="icon" onClick={searchJsonPath}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-h-[400px]">
              {output ? (
                <SyntaxHighlighter
                  language="json"
                  style={theme === "dark" ? oneDark : oneLight}
                  className="!m-0 !min-h-[400px] !bg-transparent"
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                  }}
                >
                  {searchResult || output}
                </SyntaxHighlighter>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">格式化結果將顯示在這裡...</div>
              )}
            </div>
            {output && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(searchResult || output)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
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
              </div>
            )}
          </div>
        </Card>
        {searchResult && (
          <Card className="p-4">
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
