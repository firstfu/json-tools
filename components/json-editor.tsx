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
}

function SortableCard({ item, onRemove, onLoad, onSelect, onNameChange, editingName, setEditingName }: SortableCardProps) {
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
                placeholder="輸入名稱..."
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 從 localStorage 加載數據
  useEffect(() => {
    const savedInput = localStorage.getItem("jsonEditorInput");
    const savedOutput = localStorage.getItem("jsonEditorOutput");
    const savedHistory = localStorage.getItem("jsonEditorHistory");

    if (savedInput) setInput(savedInput);
    if (savedOutput) setOutput(savedOutput);
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

  // 保存數據到 localStorage
  useEffect(() => {
    localStorage.setItem("jsonEditorInput", input);
  }, [input]);

  useEffect(() => {
    localStorage.setItem("jsonEditorOutput", output);
  }, [output]);

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
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("未知錯誤");
      }
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
      toast.success("已複製到剪貼板");
    } catch (error) {
      console.log("🚀 ~ copyToClipboard ~ error:", error);
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

  // 將 JSON 轉換為 CSV
  const convertJsonToCsv = useCallback(() => {
    try {
      if (!output) {
        toast.error("請先格式化 JSON");
        return;
      }

      const parsed = JSON.parse(output);

      // 處理不同類型的 JSON 資料
      let csvContent = "";

      // 處理陣列類型
      if (Array.isArray(parsed)) {
        // 如果陣列為空，提示用戶
        if (parsed.length === 0) {
          toast.error("JSON 陣列為空");
          return;
        }

        // 獲取所有可能的欄位名稱（合併所有物件的鍵）
        const allKeys = new Set<string>();
        parsed.forEach(item => {
          if (typeof item === "object" && item !== null) {
            Object.keys(item).forEach(key => allKeys.add(key));
          }
        });

        const headers = Array.from(allKeys);

        // 如果沒有找到有效的欄位，可能是簡單值的陣列
        if (headers.length === 0) {
          // 處理簡單值的陣列 (數字、字串等)
          csvContent =
            "value\n" +
            parsed
              .map(item => {
                if (typeof item === "string") {
                  // 如果字串包含逗號、引號或換行符，則用引號包裹並轉義引號
                  if (item.includes(",") || item.includes('"') || item.includes("\n")) {
                    return `"${item.replace(/"/g, '""')}"`;
                  }
                  return item;
                }
                return String(item);
              })
              .join("\n");
        } else {
          // 創建 CSV 內容 (物件陣列)
          csvContent = headers.join(",") + "\n";

          parsed.forEach(item => {
            const row = headers
              .map(header => {
                const value = item[header];
                // 處理不同類型的值
                if (value === undefined || value === null) {
                  return "";
                } else if (typeof value === "object") {
                  return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                } else if (typeof value === "string") {
                  // 如果字串包含逗號、引號或換行符，則用引號包裹並轉義引號
                  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                    return `"${value.replace(/"/g, '""')}"`;
                  }
                  return value;
                }
                return String(value);
              })
              .join(",");
            csvContent += row + "\n";
          });
        }
      }
      // 處理物件類型
      else if (typeof parsed === "object" && parsed !== null) {
        // 獲取物件的所有鍵
        const keys = Object.keys(parsed);

        if (keys.length === 0) {
          toast.error("JSON 物件為空");
          return;
        }

        // 創建 CSV 內容 (兩列：key 和 value)
        csvContent = "key,value\n";

        keys.forEach(key => {
          const value = parsed[key];
          let valueStr = "";

          // 處理不同類型的值
          if (value === undefined || value === null) {
            valueStr = "";
          } else if (typeof value === "object") {
            valueStr = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else if (typeof value === "string") {
            // 如果字串包含逗號、引號或換行符，則用引號包裹並轉義引號
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              valueStr = `"${value.replace(/"/g, '""')}"`;
            } else {
              valueStr = value;
            }
          } else {
            valueStr = String(value);
          }

          // 處理鍵名中的特殊字符
          let keyStr = key;
          if (key.includes(",") || key.includes('"') || key.includes("\n")) {
            keyStr = `"${key.replace(/"/g, '""')}"`;
          }

          csvContent += `${keyStr},${valueStr}\n`;
        });
      }
      // 處理簡單值 (字串、數字、布林值等)
      else {
        csvContent = "value\n";
        if (typeof parsed === "string") {
          // 如果字串包含逗號、引號或換行符，則用引號包裹並轉義引號
          if (parsed.includes(",") || parsed.includes('"') || parsed.includes("\n")) {
            csvContent += `"${parsed.replace(/"/g, '""')}"`;
          } else {
            csvContent += parsed;
          }
        } else {
          csvContent += String(parsed);
        }
      }

      return csvContent;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`轉換失敗: ${error.message}`);
      } else {
        toast.error("轉換失敗");
      }
      return null;
    }
  }, [output]);

  // 下載 CSV 檔案
  const downloadCsv = useCallback(() => {
    const csvContent = convertJsonToCsv();
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `json-to-csv-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV 下載成功");
  }, [convertJsonToCsv]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grid-rows-1">
        <div className="flex flex-col">
          <Card className="overflow-hidden border-2 border-muted flex flex-col flex-grow min-h-[calc(600px+6rem)]">
            <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium">輸入 JSON</h2>
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
                placeholder="在此輸入 JSON..."
                className="h-[600px] w-full font-mono resize-none border-0 focus-visible:ring-0 overflow-y-auto flex-grow"
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
                清除
              </Button>
            </div>
          </Card>
          {error && (
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20 mt-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col">
          <Card className="overflow-hidden border-2 border-muted flex flex-col flex-grow min-h-[calc(600px+6rem)]">
            <div className="bg-muted/50 p-3 border-b border-border">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="輸入要搜尋的文字..."
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
                      搜尋
                    </Button>
                  </div>
                  {output && (
                    <>
                      <Button variant="outline" size="sm" onClick={addToHistory} className="gap-2">
                        <History className="h-3 w-3" />
                        保存
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadCsv} className="gap-2">
                        <FileText className="h-3 w-3" />轉 CSV
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="h-4 w-4 rounded border-muted" />
                    區分大小寫
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" checked={matchWholeWord} onChange={e => setMatchWholeWord(e.target.checked)} className="h-4 w-4 rounded border-muted" />
                    全字匹配
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
                          下載格式化檔案
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadJson(JSON.stringify(JSON.parse(output)), "minified")}>
                          <Download className="h-4 w-4 mr-2" />
                          下載壓縮檔案
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={downloadCsv}>
                          <FileText className="h-4 w-4 mr-2" />
                          下載為 CSV
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
                  <div className="h-[600px] w-full flex items-center justify-center bg-muted/20 font-mono text-muted-foreground text-sm flex-grow">格式化結果將顯示在這裡...</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
