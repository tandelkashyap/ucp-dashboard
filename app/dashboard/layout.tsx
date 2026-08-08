import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="font-display text-lg font-semibold tracking-tight text-ink"
          >
            UCP
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-ink-muted transition-colors hover:text-ink">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
