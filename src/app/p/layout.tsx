import Link from "next/link";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link href="/p" className="text-lg font-semibold tracking-wide">
            CIVANA
          </Link>
          <div className="text-xs uppercase tracking-[0.18em] text-ink/50">Privates</div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/p/catalog" className="text-ink/70 hover:text-ink">Catalog</Link>
            <Link href="/p/requests" className="text-ink/70 hover:text-ink">My Requests</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
