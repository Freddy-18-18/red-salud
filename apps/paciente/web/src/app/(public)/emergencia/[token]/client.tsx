"use client";

import { Loader2 } from "lucide-react";

import {
  PublicProfileView,
  ProfileNotFound,
} from "@/components/emergency/public-profile-view";
import { usePublicEmergencyProfile } from "@/hooks/use-emergency-profile";

interface Props {
  token: string;
}

export function EmergencyProfileClient({ token }: Props) {
  const { data: profile, isLoading, error } = usePublicEmergencyProfile(token);

  // Loading state — keep it fast and clean
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-red-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-500">
            Cargando perfil de emergencia...
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !profile) {
    return <ProfileNotFound />;
  }

  return <PublicProfileView profile={profile} />;
}
