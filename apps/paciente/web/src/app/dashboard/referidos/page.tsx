"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useReferrals } from "@/hooks/use-referrals";
import { ShareButtons } from "@/components/referral/share-buttons";
import { ReferralList } from "@/components/referral/referral-list";
import { Leaderboard } from "@/components/referral/leaderboard";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { Users, Gift, Star, Trophy, UserPlus } from "lucide-react";

export default function ReferidosPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const {
    code,
    referrals,
    stats,
    leaderboard,
    loading: referralsLoading,
    shareLink,
    whatsappLink,
    copyLink,
    nativeShare,
  } = useReferrals(userId);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading || referralsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-7 w-7 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Invita a tus amigos
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Comparte Red Salud y gana puntos por cada amigo que se registre
        </p>
      </div>

      {/* Referral code card */}
      <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white">
        <p className="text-sm text-emerald-100 mb-1">Tu codigo de referido</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl sm:text-4xl font-bold tracking-wider">
            {code}
          </span>
        </div>
        <ShareButtons
          whatsappLink={whatsappLink}
          onCopyLink={copyLink}
          onNativeShare={nativeShare}
        />
      </div>

      {/* Rewards info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Gift className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Para vos</p>
              <p className="text-xs text-gray-500">+200 puntos</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Para tu amigo
              </p>
              <p className="text-xs text-gray-500">+100 puntos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Referidos</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.points}</p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Puntos ganados</p>
        </div>
      </div>

      {/* Referrals list */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Mis referidos ({referrals.length})
        </h2>
        <ReferralList referrals={referrals} />
      </section>

      {/* Leaderboard */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Ranking de referidos este mes
          </h2>
        </div>
        <Leaderboard entries={leaderboard} />
      </section>
    </div>
  );
}
