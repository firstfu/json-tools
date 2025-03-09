/**
 * DirectSchemaPreview 組件
 *
 * 功能：將普通 JSON 數據轉換為 JSON Schema
 *
 * 該組件提供了一個按鈕，點擊後會將輸入的 JSON 數據分析並生成對應的 JSON Schema。
 * 生成的 Schema 符合 JSON Schema Draft-07 標準，包含以下特性：
 *
 * 1. 自動識別數據類型（字符串、數字、布爾值、對象、數組、null）
 * 2. 自動標記非 null 值為必填字段
 * 3. 智能處理數組：
 *    - 如果數組中所有項目類型相同，使用單一類型定義
 *    - 如果數組中項目類型不同，使用 oneOf 定義
 * 4. 遞歸處理嵌套對象和數組
 *
 * 使用方式：
 * 1. 將 JSON 數據傳入 schema 屬性
 * 2. 點擊「生成 Schema」按鈕
 * 3. 查看生成的 JSON Schema
 * 4. 可以複製生成的 Schema 或關閉預覽
 */

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Copy, X } from "lucide-react";
import type { TranslationKey } from "@/app/i18n/utils";
import type { JSONValue } from "./types";

interface DirectSchemaPreviewProps {
  schema: string;
  t: (key: TranslationKey) => string;
}

export function DirectSchemaPreview({ schema, t }: DirectSchemaPreviewProps) {
  const { theme } = useTheme();
  const [jsonSchema, setJsonSchema] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible && schema) {
      try {
        // 解析 JSON 數據
        const jsonObj = JSON.parse(schema);
        // console.log("解析的 JSON 對象:", jsonObj);

        // 檢查是否為有效的 JSON 對象
        if (typeof jsonObj !== "object" || jsonObj === null) {
          setError(t("無效的 JSON 格式"));
          return;
        }

        // 生成 JSON Schema
        const generatedSchema = generateJsonSchema(jsonObj);
        // console.log("生成的 Schema:", generatedSchema);

        // 設置生成的 Schema
        setJsonSchema(JSON.stringify(generatedSchema, null, 2));
        setError(null);
      } catch (err) {
        console.error("Schema 生成錯誤:", err);
        setError(err instanceof Error ? err.message : t("無法解析 JSON 數據"));
        setJsonSchema("");
      }
    }
  }, [isVisible, schema, t]);

  // 根據 JSON 數據生成 JSON Schema
  const generateJsonSchema = (json: any): any => {
    // 基本函數：獲取值的類型
    const getType = (value: any): string => {
      if (value === null) return "null";
      if (Array.isArray(value)) return "array";
      return typeof value;
    };

    // 處理對象
    const processObject = (obj: Record<string, any>): any => {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(obj)) {
        properties[key] = processValue(value);

        // 假設所有非 null 值都是必需的
        if (value !== null) {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      };
    };

    // 處理數組
    const processArray = (arr: any[]): any => {
      if (arr.length === 0) {
        return {
          type: "array",
          items: {},
        };
      }

      // 檢查數組中的所有項是否具有相同的類型
      const firstType = getType(arr[0]);
      const allSameType = arr.every(item => getType(item) === firstType);

      if (allSameType) {
        // 如果所有項都是相同類型，使用第一項作為示例
        return {
          type: "array",
          items: processValue(arr[0]),
        };
      } else {
        // 如果項的類型不同，使用 oneOf
        return {
          type: "array",
          items: {
            oneOf: arr.map(item => processValue(item)),
          },
        };
      }
    };

    // 處理任何值
    const processValue = (value: any): any => {
      const type = getType(value);

      switch (type) {
        case "object":
          return processObject(value);
        case "array":
          return processArray(value);
        case "string":
          return { type: "string" };
        case "number":
          return { type: "number" };
        case "boolean":
          return { type: "boolean" };
        case "null":
          return { type: "null" };
        default:
          return {};
      }
    };

    // 生成完整的 Schema
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      ...processValue(json),
    };

    return schema;
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

  const handlePreviewClick = () => {
    setIsVisible(true);
  };

  return (
    <div className="w-full">
      {!isVisible ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreviewClick}
          className="gap-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-medium px-4 py-2 rounded-md shadow-sm"
        >
          <Eye className="h-4 w-4" />
          {t("生成 Schema")}
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col border-green-200 dark:border-green-800">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">{t("生成的 JSON Schema")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(jsonSchema)} className="h-7 px-2">
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {t("複製")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-7 w-7 p-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1 overflow-hidden">
              {error ? (
                <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </Card>
              ) : (
                <div className="border border-muted rounded-md overflow-hidden h-full">
                  <MonacoEditor
                    height="calc(90vh - 120px)"
                    defaultLanguage="json"
                    value={jsonSchema}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
