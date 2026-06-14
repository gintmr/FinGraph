import { Dashboard } from "@/components/dashboard/dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardPayload } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await getDashboardPayload();

  return (
    <AppShell>
      <Dashboard payload={payload} />
    </AppShell>
  );
}

