"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@red-salud/design-system";
import { EmergencyButton } from "@/components/emergency/emergency-button";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { PatientNavbar } from "@/components/layout/dashboard-navbar";
import { PatientSidebar } from "@/components/layout/patient-sidebar";
import { NavSheet } from "@/components/layout/nav-sheet";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { ConnectivityBanner } from "@/components/pwa/connectivity-banner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { cachePatientData } from "@/lib/offline/offline-manager";
import { getUnreadMessagesCount } from "@/lib/services/messaging-service";
import { getUnreadCount } from "@/lib/services/notification-service";
import { supabase } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.full_name || "");
      setUserEmail(user.email ?? undefined);
      setAvatarUrl(user.user_metadata?.avatar_url);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, state, onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) setUserName(profile.full_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      const dismissedLocally = (() => {
        try {
          return typeof window !== "undefined" &&
            window.localStorage.getItem(`paciente:onboarding-dismissed:${user.id}`) === "1";
        } catch {
          return false;
        }
      })();
      const onboardingDone = !!profile?.onboarding_completed_at || dismissedLocally;
      const profileIncomplete = !profile?.full_name || !profile?.state;
      if (profileIncomplete && !onboardingDone) {
        setShowOnboarding(true);
      }

      const result = await getUnreadMessagesCount(user.id);
      if (result.success) setUnreadCount(result.data);

      const notifResult = await getUnreadCount(user.id);
      if (notifResult.success) setNotifCount(notifResult.data);

      cachePatientData(user.id).catch(() => {});
    };

    loadUser();

    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const result = await getUnreadMessagesCount(user.id);
        if (result.success) setUnreadCount(result.data);

        const notifResult = await getUnreadCount(user.id);
        if (notifResult.success) setNotifCount(notifResult.data);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <PatientNavbar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        notificationCount={notifCount}
        onMenuClick={() => setNavSheetOpen(true)}
      />
      <ConnectivityBanner />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 min-h-[calc(100dvh-4rem)] p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar onMenuClick={() => setNavSheetOpen(true)} />
      <NavSheet
        open={navSheetOpen}
        onOpenChange={setNavSheetOpen}
        pathname={pathname}
      />
      <EmergencyButton />
      <InstallPrompt />
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
