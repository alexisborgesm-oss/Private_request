// src/app/staff/login/page.tsx
import { StaffPasswordLoginForm } from "@/components/staff/StaffPasswordLoginForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Staff sign-in</div>
      <p className="mt-2 text-sm text-ink/70">
        Sign in with email + password (no emails, no rate limits).
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <StaffPasswordLoginForm />
      </div>
    </div>
  );
}
