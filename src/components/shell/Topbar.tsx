"use client";
import { Search, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/p/login");
    router.refresh();
  };

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="relative w-full max-w-[680px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
          <input
            placeholder="Search"
            className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <button onClick={signOut} className="ml-auto rounded-full p-2 hover:bg-black/5" aria-label="Sign out">
          <LogOut size={18} className="text-ink/70" />
        </button>
        <div className="h-9 w-9 rounded-full bg-black/10" />
      </div>
    </div>
  );
}
