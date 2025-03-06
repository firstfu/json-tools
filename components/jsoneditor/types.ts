import type { editor } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import type { TranslationKey } from "@/app/i18n/utils";

export interface HistoryItem {
  id: string;
  content: string;
  timestamp: Date;
  name: string;
}

export interface MonacoRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface MonacoDecorationOptions {
  inlineClassName?: string;
  className?: string;
  stickiness?: number;
}

export interface MonacoEditorType extends editor.IStandaloneCodeEditor {
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

export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };

export interface SortableCardProps {
  item: HistoryItem;
  onRemove: (id: string) => void;
  onLoad: (content: string) => void;
  onSelect: (item: HistoryItem) => void;
  onNameChange: (id: string, newName: string) => void;
  editingName: string | null;
  setEditingName: (id: string | null) => void;
  t: (key: TranslationKey) => string;
}

export type EditorOnMount = OnMount;
