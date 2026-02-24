import { staffPasswordLogin } from "./actions";

export default function Page({
  searchParams,
}: {
  searchParams?: { e?: string };
}) {
  const err =
    searchParams?.e === "missing"
      ? "Email and password are required."
      : searchParams?.e === "invalid"
      ? "Invalid credentials."
      : null;

  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Staff sign-in</div>
      <p className="mt-2 text-sm text-ink/70">
        Sign in with email + password (no emails, no rate limits).
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <form action={staffPasswordLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white">
            Sign in
          </button>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}
        </form>
      </div>
    </div>
  );
}
