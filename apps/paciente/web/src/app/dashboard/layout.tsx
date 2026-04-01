"use client";

import { useEffect, useState, type ReactNode } from "react";

import { EmergencyButton } from "@/components/emergency/emergency-button";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { PatientNavbar } from "@/components/layout/dashboard-navbar";
import { PatientSidebar } from "@/components/layout/patient-sidebar";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { ConnectivityBanner } from "@/components/pwa/connectivity-banner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { cachePatientData } from "@/lib/offline/offline-manager";
import { getUnreadMessagesCount } from "@/lib/services/messaging-service";
import { getUnreadCount } from "@/lib/services/notification-service";
import { supabase } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url);

      // Load profile for potentially more complete data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, state")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) setUserName(profile.full_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      // Check if profile is incomplete → show onboarding
      if (!profile?.full_name || !profile?.state) {
        setShowOnboarding(true);
      }

      // Get unread messages count
      const result = await getUnreadMessagesCount(user.id);
      if (result.success) setUnreadCount(result.data);

      // Get unread notification count
      const notifResult = await getUnreadCount(user.id);
      if (notifResult.success) setNotifCount(notifResult.data);

      // Cache patient data for offline access
      cachePatientData(user.id).catch(() => {});
    };

    loadUser();

    // Poll for unread messages and notifications every 30s
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
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar
        userName={userName}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        notificationCount={notifCount}
      />
      <ConnectivityBanner />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar />
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
