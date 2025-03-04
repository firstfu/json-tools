import { JsonEditor } from "@/components/json-editor";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">JSON 格式化工具</h1>
          <p className="text-muted-foreground">輕鬆格式化、驗證和轉換您的 JSON 數據</p>
        </header>
        <ThemeToggle />
      </div>
      <JsonEditor />
    </main>
  );
}
