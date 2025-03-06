"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileJson, Upload, X, Maximize2 } from "lucide-react";
import type { SortableCardProps } from "./types";

export function SortableCard({ item, onRemove, onLoad, onSelect, onNameChange, editingName, setEditingName, t }: SortableCardProps) {
  const { theme } = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [editorKey, setEditorKey] = useState(item.id);

  // 當拖曳結束時重新生成 Editor
  useEffect(() => {
    if (!isDragging) {
      setEditorKey(prev => `${prev}-${Date.now()}`);
    }
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card style={style} className="relative overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all group">
      {/* 標題區域 - 不可拖曳 */}
      <div className="p-2 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-move hover:bg-muted/50 rounded-sm group/drag flex items-center justify-center"
              {...attributes}
              {...listeners}
            >
              <div className="flex flex-col gap-[3px] opacity-50 group-hover/drag:opacity-100 transition-opacity">
                <div className="flex gap-[3px]">
                  <div className="w-1 h-1 rounded-full bg-foreground"></div>
                  <div className="w-1 h-1 rounded-full bg-foreground"></div>
                </div>
                <div className="flex gap-[3px]">
                  <div className="w-1 h-1 rounded-full bg-foreground"></div>
                  <div className="w-1 h-1 rounded-full bg-foreground"></div>
                </div>
              </div>
            </Button>
            {editingName === item.id ? (
              <Input
                className="h-6 text-sm w-full"
                defaultValue={item.name}
                autoFocus
                placeholder={t("輸入名稱...")}
                onBlur={e => {
                  const value = e.target.value.trim();
                  if (value) {
                    onNameChange(item.id, value);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      onNameChange(item.id, value);
                    }
                  } else if (e.key === "Escape") {
                    setEditingName(null);
                  }
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <h3 className="text-sm font-medium flex-1">{item.name}</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingName(item.id)}>
                  <FileJson className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onSelect(item)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onLoad(item.content)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onRemove(item.id)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 內容區域 - 可拖曳 */}
      <div ref={setNodeRef} className="cursor-move">
        <div className="h-[300px] overflow-y-auto p-3">
          {!isDragging && (
            <MonacoEditor
              key={editorKey}
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
              loading={<div className="h-full flex items-center justify-center text-muted-foreground">載入中...</div>}
            />
          )}
        </div>
        <div className="bg-muted/50 p-2 text-xs text-muted-foreground border-t border-border">保存時間：{item.timestamp.toLocaleString()}</div>
      </div>
    </Card>
  );
}
