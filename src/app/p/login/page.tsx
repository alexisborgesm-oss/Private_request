import { LoginForm } from "@/components/guest/LoginForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <div className="text-2xl font-semibold">Guest access</div>
      <p className="mt-2 text-sm text-ink/70">Enter your email to receive a secure sign-in link.</p>
      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <LoginForm />
      </div>
    </div>
  );
}
