"use client";

import { useTheme } from "next-themes";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { HistoryItem } from "./types";
import type { editor } from "monaco-editor";
import type { TranslationKey } from "@/app/i18n/utils";

interface JsonCompareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftItem: HistoryItem | null;
  rightItem: HistoryItem | null;
  t: (key: TranslationKey) => string;
}

export function JsonCompare({ open, onOpenChange, leftItem, rightItem, t }: JsonCompareProps) {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<"left" | "right" | "both">("both");
  const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 當視圖改變時，調整編輯器大小
  useEffect(() => {
    if (leftEditorRef.current) {
      leftEditorRef.current.layout();
    }
    if (rightEditorRef.current) {
      rightEditorRef.current.layout();
    }
  }, [currentView]);

  // 當對話框打開時，重置視圖
  useEffect(() => {
    if (open) {
      setCurrentView("both");
    }
  }, [open]);

  const handleLeftEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    leftEditorRef.current = editor;
  };

  const handleRightEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    rightEditorRef.current = editor;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {t("比對 JSON")}：{leftItem?.name} vs {rightItem?.name}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button variant={currentView === "left" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("left")} className="px-3">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {leftItem?.name || t("左側")}
            </Button>
            <Button variant={currentView === "both" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("both")} className="px-3">
              {t("並排比對")}
            </Button>
            <Button variant={currentView === "right" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("right")} className="px-3">
              {rightItem?.name || t("右側")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex">
          {(currentView === "left" || currentView === "both") && (
            <div className={`${currentView === "both" ? "w-1/2 pr-2" : "w-full"} h-full flex flex-col`}>
              <div className="text-sm font-medium p-2 bg-muted/50 border-b">{leftItem?.name || t("左側 JSON")}</div>
              <div className="flex-1 min-h-0 border-r">
                {leftItem && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="json"
                    value={leftItem.content}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    onMount={handleLeftEditorDidMount}
                    options={{
                      readOnly: true,
                      minimap: { enabled: true },
                      folding: true,
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {(currentView === "right" || currentView === "both") && (
            <div className={`${currentView === "both" ? "w-1/2 pl-2" : "w-full"} h-full flex flex-col`}>
              <div className="text-sm font-medium p-2 bg-muted/50 border-b">{rightItem?.name || t("右側 JSON")}</div>
              <div className="flex-1 min-h-0">
                {rightItem && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="json"
                    value={rightItem.content}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    onMount={handleRightEditorDidMount}
                    options={{
                      readOnly: true,
                      minimap: { enabled: true },
                      folding: true,
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            {t("關閉")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
