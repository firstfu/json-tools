import { JsonEditor } from "@/components/json-editor";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="max-w-[1200px] mx-auto px-4">
      <Header />
      <div className="py-8">
        <JsonEditor />
      </div>
    </main>
  );
}
