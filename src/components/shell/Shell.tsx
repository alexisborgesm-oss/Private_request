import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar />
        <div className="px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
