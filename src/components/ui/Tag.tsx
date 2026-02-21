import { cn } from "@/lib/cn";
export function Tag({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "teal" | "red" | "amber" }) {
  const m = {
    gray: "bg-black/5 text-ink/70",
    teal: "bg-accentSoft text-accent",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700"
  } as const;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", m[tone])}>{children}</span>;
}
