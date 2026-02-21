"use client";
import { cn } from "@/lib/cn";

export function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-ink/80">{label}</div> : null}
      <textarea
        className={cn(
          "min-h-[96px] w-full resize-y rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...props}
      />
    </label>
  );
}
