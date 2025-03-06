import type { JSONValue, JSONObject } from "./types";

export const jsonToCSV = (jsonData: JSONValue): string => {
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
