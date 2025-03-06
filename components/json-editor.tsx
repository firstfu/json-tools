"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Copy, Download, MoreVertical, Search, FileJson, Minimize2, History, X, Maximize2, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useParams } from "next/navigation";
import { useTranslations, type TranslationKey } from "@/app/i18n/utils";

interface HistoryItem {
  id: string;
  content: string;
  timestamp: Date;
  name: string;
}

interface SortableCardProps {
  item: HistoryItem;
  onRemove: (id: string) => void;
  onLoad: (content: string) => void;
  onSelect: (item: HistoryItem) => void;
  onNameChange: (id: string, newName: string) => void;
  editingName: string | null;
  setEditingName: (id: string | null) => void;
  t: (key: TranslationKey) => string;
}

function SortableCard({ item, onRemove, onLoad, onSelect, onNameChange, editingName, setEditingName, t }: SortableCardProps) {
  const { theme } = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [showEditor, setShowEditor] = useState(false);
  const mountTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 處理編輯器的掛載邏輯
  useEffect(() => {
    // 清除之前的計時器
    if (mountTimeoutRef.current) {
      clearTimeout(mountTimeoutRef.current);
    }

    if (isDragging) {
      setShowEditor(false);
    } else {
      // 增加延遲時間，確保 DOM 完全更新
      mountTimeoutRef.current = setTimeout(() => {
        setShowEditor(true);
      }, 300);
    }

    return () => {
      if (mountTimeoutRef.current) {
        clearTimeout(mountTimeoutRef.current);
      }
    };
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
          {showEditor && !isDragging ? (
            <MonacoEditor
              key={`${item.id}-${Date.now()}`}
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
                automaticLayout: true,
              }}
              loading={<div className="h-full flex items-center justify-center text-muted-foreground">載入中...</div>}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">{isDragging ? "拖曳中..." : "載入中..."}</div>
          )}
        </div>
        <div className="bg-muted/50 p-2 text-xs text-muted-foreground border-t border-border">保存時間：{item.timestamp.toLocaleString()}</div>
      </div>
    </Card>
  );
}

interface MonacoRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface MonacoDecorationOptions {
  inlineClassName?: string;
  className?: string;
  stickiness?: number;
}

// 更新 MonacoEditorType 介面
interface MonacoEditorType extends editor.IStandaloneCodeEditor {
  getModel: () => editor.ITextModel & {
    findMatches: (
      searchString: string,
      searchOnlyEditableRange: boolean,
      isRegex: boolean,
      matchCase: boolean,
      wordSeparators: string | null,
      captureMatches: boolean
    ) => Array<{ range: MonacoRange }>;
    getAllDecorations: () => Array<{ id: string }>;
  };
  deltaDecorations: (oldDecorations: string[], newDecorations: Array<{ range: MonacoRange; options: MonacoDecorationOptions }>) => string[];
  revealLineInCenter: (lineNumber: number) => void;
}

// 定義基礎 JSON 值型別
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
type JSONObject = { [key: string]: JSONValue };

// 添加 JSON 轉 CSV 的工具函數
const jsonToCSV = (jsonData: JSONValue): string => {
  try {
    // 確保輸入是陣列
    const array = Array.isArray(jsonData) ? jsonData : [jsonData];
    if (array.length === 0) return "";

    // 獲取所有可能的欄位（扁平化處理）
    const getFields = (obj: JSONObject, prefix = ""): string[] => {
      let fields: string[] = [];
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          fields = [...fields, ...getFields(value as JSONObject, newKey)];
        } else {
          fields.push(newKey);
        }
      }
      return fields;
    };

    // 從所有物件中收集唯一的欄位
    const allFields = Array.from(new Set(array.reduce((fields: string[], item) => [...fields, ...getFields(item as JSONObject)], []))).sort();

    // 獲取物件中特定路徑的值
    const getNestedValue = (obj: JSONObject, path: string): string => {
      const value = path.split(".").reduce<JSONValue | undefined>((o, i) => {
        if (o && typeof o === "object" && !Array.isArray(o)) {
          return (o as JSONObject)[i];
        }
        return undefined;
      }, obj);
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === "object") return JSON.stringify(value);
      return String(value).replace(/"/g, '""');
    };

    // 生成 CSV 內容
    const header = allFields.join(",");
    const rows = array.map(obj => allFields.map(field => `"${getNestedValue(obj as JSONObject, field)}"`).join(","));

    return [header, ...rows].join("\n");
  } catch (error) {
    console.error("JSON to CSV conversion error:", error);
    throw new Error("轉換 CSV 時發生錯誤");
  }
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MonacoEditorType | null>(null);
  const { theme } = useTheme();
  const params = useParams();
  const { t } = useTranslations(params.lang as "en" | "zh-TW");

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("已複製到剪貼板"));
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error(t("複製失敗"));
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
    toast.success(t("下載成功"));
  };

  const addToHistory = useCallback(() => {
    if (!output) return;

    if (history.length >= 6) {
      toast.error(t("已達到最大歷史記錄數量（6個）"));
      return;
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      content: output,
      timestamp: new Date(),
      name: `JSON ${history.length + 1}`,
    };

    setHistory(prev => [newItem, ...prev]);
    toast.success(t("已添加到歷史記錄"));
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

  const handleEditorDidMount: OnMount = editor => {
    editorRef.current = editor as unknown as MonacoEditorType;
  };

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
                        <Button variant="outline" size="sm" onClick={addToHistory} className="gap-2">
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
        </div>
      </div>
    </div>
  );
}
