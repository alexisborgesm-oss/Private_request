"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ClipboardList, CalendarDays, Settings, MapPin, UserSquare2, Home } from "lucide-react";

const nav = [
  { href: "/staff", label: "Home", icon: Home },
  { href: "/staff/front-desk/requests", label: "Requests", icon: ClipboardList },
  { href: "/staff/programs/requests", label: "Leader inbox", icon: ClipboardList },
  { href: "/staff/programs/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/staff/programs/admin/private_classes", label: "Private classes", icon: Settings },
  { href: "/staff/programs/admin/instructors", label: "Instructors", icon: UserSquare2 },
  { href: "/staff/programs/admin/locations", label: "Locations", icon: MapPin }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden h-screen w-[272px] shrink-0 border-r border-border bg-sidebar md:block">
      <div className="px-6 py-6">
        <div className="text-xl font-semibold tracking-wide">CIVANA</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink/60">Wellness Resort & Spa</div>
      </div>
      <nav className="px-3">
        {nav.map((n) => {
          const active = pathname === n.href || pathname?.startsWith(n.href + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-black/5",
                active && "bg-black/5 text-ink"
              )}
            >
              <Icon size={18} className="opacity-80" />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
