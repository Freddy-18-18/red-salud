import { redirect } from "next/navigation";
import {
  getPharmacyForUser,
  getUserProfile,
  getUnreadAlertCount,
} from "@/lib/services/dashboard-service";
import { getLatestExchangeRate } from "@/lib/services/exchange-rate-service";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallel data fetching — all independent queries
  const [pharmacy, user, exchangeRate] = await Promise.all([
    getPharmacyForUser(),
    getUserProfile(),
    getLatestExchangeRate(),
  ]);

  // No authenticated user → login
  if (!user) {
    redirect("/auth/login");
  }

  // No pharmacy associated → onboarding
  if (!pharmacy) {
    redirect("/onboarding");
  }

  // Get alert counts (depends on pharmacy.id)
  const alertCounts = await getUnreadAlertCount(pharmacy.id);

  return (
    <DashboardShell
      pharmacy={pharmacy}
      user={user}
      exchangeRate={exchangeRate}
      unreadAlerts={alertCounts.total}
      criticalAlerts={alertCounts.critical}
    >
      {children}
    </DashboardShell>
  );
}
