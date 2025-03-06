import { Header } from "@/components/header";
import { JsonEditor } from "@/components/jsoneditor";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <JsonEditor />
      </main>
      <Footer />
    </div>
  );
}
