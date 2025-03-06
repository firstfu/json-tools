"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileJson, Minimize2, Upload, X } from "lucide-react";
import type { TranslationKey } from "@/app/i18n/utils";

interface JsonInputProps {
  input: string;
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setError: (value: string | null) => void;
  error: string | null;
  formatJson: () => void;
  minifyJson: () => void;
  t: (key: TranslationKey) => string;
}

export function JsonInput({ input, setInput, setOutput, setError, error, formatJson, minifyJson, t }: JsonInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("未知錯誤");
        }
      }
    };
    reader.onerror = () => {
      setError("讀取檔案時發生錯誤");
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col md:w-1/2">
      <Card className="overflow-hidden border-2 border-muted flex flex-col flex-grow min-h-[calc(600px+6rem)]">
        <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium">{t("輸入 JSON")}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <Textarea
            placeholder={t("json_example")}
            className="h-[600px] w-full font-mono resize-none border-0 focus-visible:ring-0 overflow-y-auto flex-grow"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="application/json,.json" onChange={handleFileUpload} />
        </div>
        <div className="bg-muted/50 p-3 border-t border-border flex items-center gap-2">
          <Button onClick={formatJson} className="gap-2" variant="secondary">
            <FileJson className="h-4 w-4" />
            {t("格式化")}
          </Button>
          <Button variant="outline" onClick={minifyJson} className="gap-2">
            <Minimize2 className="h-4 w-4" />
            {t("壓縮")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setInput("");
              setOutput("");
              setError(null);
            }}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t("清除")}
          </Button>
        </div>
      </Card>
      {error && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20 mt-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
    </div>
  );
}
