"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import type { PharmacyProfile, UserProfile } from "@/lib/services/dashboard-service";
import type { ExchangeRate } from "@/lib/services/exchange-rate-service";

interface DashboardShellProps {
  pharmacy: PharmacyProfile;
  user: UserProfile;
  exchangeRate: ExchangeRate | null;
  unreadAlerts: number;
  criticalAlerts: number;
  children: React.ReactNode;
}

export function DashboardShell({
  pharmacy,
  user,
  exchangeRate,
  unreadAlerts,
  criticalAlerts,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <Sidebar
        pharmacy={pharmacy}
        user={user}
        unreadAlerts={unreadAlerts}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          pharmacy={pharmacy}
          user={user}
          exchangeRate={exchangeRate}
          unreadAlerts={unreadAlerts}
          criticalAlerts={criticalAlerts}
        />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
