"use client";
import { cn } from "@/lib/cn";

export function Input({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-ink/80">{label}</div> : null}
      <input
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-ink/50">{hint}</div> : null}
    </label>
  );
}
