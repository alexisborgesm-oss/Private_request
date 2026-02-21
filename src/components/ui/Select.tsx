"use client";
import { cn } from "@/lib/cn";

export function Select({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-ink/80">{label}</div> : null}
      <select
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
