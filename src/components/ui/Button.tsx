"use client";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "teal";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 h-10 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50";
  const v = {
    primary: "bg-ink text-white hover:opacity-90",
    teal: "bg-accent text-white hover:opacity-90",
    outline: "border border-border bg-white hover:bg-black/5"
  } as const;
  return <button className={cn(base, v[variant], className)} {...props} />;
}
