import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { CreateMerchantForm } from "@/components/create-merchant-form";

type Merchant = {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "active" | "suspended";
};

export default async function DashboardPage() {
  const merchants = await getMerchants();

  if (merchants.length === 0) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
          Set up your first merchant
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          This is the account your store connections and agent credentials will live under.
        </p>
        <CreateMerchantForm />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
        Merchants
      </h1>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
        {merchants.map((merchant) => (
          <li key={merchant.id}>
            <Link
              href={`/dashboard/${merchant.slug}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-background"
            >
              <div>
                <p className="text-sm font-medium text-ink">{merchant.name}</p>
                <p className="font-mono text-xs text-ink-muted">{merchant.slug}</p>
              </div>
              <StatusBadge status={merchant.status} />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 max-w-sm">
        <h2 className="text-sm font-medium text-ink">Add another merchant</h2>
        <CreateMerchantForm />
      </div>
    </div>
  );
}

async function getMerchants(): Promise<Merchant[]> {
  try {
    return await apiFetch<Merchant[]>("/merchants");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }
}

function StatusBadge({ status }: { status: Merchant["status"] }) {
  const styles = {
    active: "bg-accent/10 text-accent",
    pending: "bg-warn-bg text-warn",
    suspended: "bg-danger-bg text-danger",
  } as const;

  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}
