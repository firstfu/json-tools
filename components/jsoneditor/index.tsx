"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { DragEndEvent } from "@dnd-kit/core";
import { useTranslations } from "@/app/i18n/utils";
import { SortableCard } from "./SortableCard";
import { JsonInput } from "./JsonInput";
import { JsonOutput } from "./JsonOutput";
import type { HistoryItem, MonacoEditorType, EditorOnMount } from "./types";

export function JsonEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [matchCase, setMatchCase] = useState(true);
  const [matchWholeWord, setMatchWholeWord] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const editorRef = useRef<MonacoEditorType | null>(null);
  const params = useParams();
  const { t } = useTranslations(params.lang as "en" | "zh-TW");
  const { theme } = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 只從 localStorage 加載歷史記錄
  useEffect(() => {
    const savedHistory = localStorage.getItem("jsonEditorHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // 轉換時間戳為 Date 對象
        const historyWithDates = parsedHistory.map((item: Omit<HistoryItem, "timestamp"> & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error("Error parsing history:", error);
      }
    }
  }, []);

  // 只保存歷史記錄到 localStorage
  useEffect(() => {
    localStorage.setItem("jsonEditorHistory", JSON.stringify(history));
  }, [history]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHistory(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setError(t("請輸入 JSON 文本"));
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
              .reduce<Record<string, unknown> | unknown[]>(
                (sorted, key) => {
                  if (Array.isArray(sorted)) {
                    (sorted as unknown[])[Number(key)] = value[key];
                  } else {
                    (sorted as Record<string, unknown>)[key] = value[key];
                  }
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
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("未知錯誤");
      }
    }
  }, [input, t]);

  const minifyJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setError(t("請輸入 JSON 文本"));
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("未知錯誤");
      }
    }
  }, [input, t]);

  const handleSearch = useCallback(() => {
    if (!editorRef.current || !searchText) {
      setTotalMatches(0);
      setCurrentMatchIndex(0);
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();
    const decorations = editor.getModel().getAllDecorations();

    // 清除之前的裝飾
    editor.deltaDecorations(
      decorations.map(d => d.id),
      []
    );

    if (searchText) {
      const matches = model.findMatches(searchText, false, matchCase, matchWholeWord, null, true);

      setTotalMatches(matches.length);
      setCurrentMatchIndex(matches.length > 0 ? 1 : 0);

      if (matches.length > 0) {
        // 添加新的高亮裝飾
        editor.deltaDecorations(
          [],
          matches.map(match => ({
            range: match.range,
            options: {
              inlineClassName: "findMatch",
              className: "findMatch",
              stickiness: 1,
            },
          }))
        );

        // 滾動到第一個匹配項
        editor.revealLineInCenter(matches[0].range.startLineNumber);
      }
    }
  }, [searchText, matchCase, matchWholeWord]);

  const navigateMatch = useCallback(
    (direction: "next" | "prev") => {
      if (!editorRef.current || totalMatches === 0) return;

      const editor = editorRef.current;
      const model = editor.getModel();
      const matches = model.findMatches(searchText, false, matchCase, matchWholeWord, null, true);

      if (matches.length > 0) {
        let newIndex;
        if (direction === "next") {
          newIndex = (currentMatchIndex % matches.length) + 1;
        } else {
          newIndex = currentMatchIndex - 1 || matches.length;
        }
        setCurrentMatchIndex(newIndex);

        const match = matches[newIndex - 1];
        editor.revealLineInCenter(match.range.startLineNumber);
      }
    },
    [searchText, matchCase, matchWholeWord, currentMatchIndex, totalMatches]
  );

  const addToHistory = useCallback(() => {
    if (!output) return false;

    if (history.length >= 3) {
      toast.error(t("已達到最大歷史記錄數量（3個）"));
      return false;
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      content: output,
      timestamp: new Date(),
      name: `JSON ${history.length + 1}`,
    };

    setHistory(prev => [newItem, ...prev]);
    return true;
  }, [output, history, t]);

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

  const handleEditorDidMount: EditorOnMount = editor => {
    editorRef.current = editor as unknown as MonacoEditorType;
  };

  return (
    <div id="json-editor-section" className="w-full">
      <div className="space-y-6">
        {history.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SortableContext items={history.map(item => item.id)}>
                {history.map(item => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    onRemove={removeFromHistory}
                    onLoad={loadFromHistory}
                    onSelect={setSelectedItem}
                    onNameChange={updateHistoryName}
                    editingName={editingName}
                    setEditingName={setEditingName}
                    t={t}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}

        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedItem?.name || "JSON 內容"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {selectedItem && (
                <MonacoEditor
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

        <div className="flex flex-col md:flex-row gap-6">
          <JsonInput input={input} setInput={setInput} setOutput={setOutput} setError={setError} error={error} formatJson={formatJson} minifyJson={minifyJson} t={t} />

          <JsonOutput
            output={output}
            searchText={searchText}
            setSearchText={setSearchText}
            matchCase={matchCase}
            setMatchCase={setMatchCase}
            matchWholeWord={matchWholeWord}
            setMatchWholeWord={setMatchWholeWord}
            currentMatchIndex={currentMatchIndex}
            totalMatches={totalMatches}
            handleSearch={handleSearch}
            navigateMatch={navigateMatch}
            addToHistory={addToHistory}
            handleEditorDidMount={handleEditorDidMount}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
