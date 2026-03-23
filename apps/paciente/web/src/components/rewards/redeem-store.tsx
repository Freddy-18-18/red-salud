"use client";

import { useState } from "react";
import {
  Gift,
  ShoppingBag,
  Video,
  Pill,
  FlaskConical,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RedeemableReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointCost: number;
  category: string;
}

interface RedeemStoreProps {
  totalPoints: number;
  onRedeem: (
    rewardId: string,
    pointCost: number,
    rewardName: string
  ) => Promise<{ success: boolean } | undefined>;
}

const REDEEMABLE_REWARDS: RedeemableReward[] = [
  {
    id: "telemedicina-gratis",
    name: "Telemedicina gratis",
    description: "Una consulta de telemedicina sin costo",
    icon: "video",
    pointCost: 500,
    category: "consulta",
  },
  {
    id: "descuento-farmacia",
    name: "Descuento en farmacia",
    description: "15% de descuento en tu proxima compra en farmacia",
    icon: "pill",
    pointCost: 300,
    category: "farmacia",
  },
  {
    id: "laboratorio-gratis",
    name: "Examen de laboratorio",
    description: "Un examen de laboratorio basico sin costo",
    icon: "flask",
    pointCost: 200,
    category: "laboratorio",
  },
  {
    id: "consulta-prioritaria",
    name: "Cita prioritaria",
    description: "Agenda una cita con prioridad, sin tiempo de espera",
    icon: "gift",
    pointCost: 400,
    category: "consulta",
  },
  {
    id: "checkup-basico",
    name: "Chequeo basico gratuito",
    description: "Un chequeo medico basico completo",
    icon: "shopping",
    pointCost: 800,
    category: "consulta",
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  video: Video,
  pill: Pill,
  flask: FlaskConical,
  gift: Gift,
  shopping: ShoppingBag,
};

interface ConfirmDialogProps {
  reward: RedeemableReward;
  totalPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
  redeeming: boolean;
}

function ConfirmDialog({
  reward,
  totalPoints,
  onConfirm,
  onCancel,
  redeeming,
}: ConfirmDialogProps) {
  const Icon = ICON_MAP[reward.icon] || Gift;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-amber-500" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Canjear {reward.name}?
          </h3>
          <p className="text-sm text-gray-500 mb-4">{reward.description}</p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl font-bold text-amber-600">
              {reward.pointCost}
            </span>
            <span className="text-sm text-gray-500">puntos</span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Tu saldo despues del canje:{" "}
            <span className="font-semibold text-gray-600">
              {totalPoints - reward.pointCost} pts
            </span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={redeeming}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={redeeming}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-medium text-sm rounded-xl hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {redeeming ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Canjear
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RedeemStore({ totalPoints, onRedeem }: RedeemStoreProps) {
  const [confirmReward, setConfirmReward] = useState<RedeemableReward | null>(
    null
  );
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!confirmReward) return;
    setRedeeming(true);

    const result = await onRedeem(
      confirmReward.id,
      confirmReward.pointCost,
      confirmReward.name
    );

    setRedeeming(false);

    if (result?.success) {
      setRedeemSuccess(confirmReward.name);
      setConfirmReward(null);
      setTimeout(() => setRedeemSuccess(null), 3000);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Canjear Puntos
          </h3>
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
            {totalPoints.toLocaleString()} pts disponibles
          </span>
        </div>

        {/* Success message */}
        {redeemSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-slide-down">
            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              Canjeaste <span className="font-semibold">{redeemSuccess}</span>{" "}
              exitosamente!
            </p>
          </div>
        )}

        <div className="space-y-3">
          {REDEEMABLE_REWARDS.map((reward) => {
            const Icon = ICON_MAP[reward.icon] || Gift;
            const canAfford = totalPoints >= reward.pointCost;

            return (
              <div
                key={reward.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  canAfford
                    ? "border-gray-100 hover:border-amber-200 hover:shadow-sm"
                    : "border-gray-50 opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    canAfford
                      ? "bg-amber-50 text-amber-500"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {reward.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {reward.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      canAfford ? "text-amber-600" : "text-gray-400"
                    }`}
                  >
                    {reward.pointCost} pts
                  </span>
                  <button
                    onClick={() => canAfford && setConfirmReward(reward)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      canAfford
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Canjear
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmReward && (
        <ConfirmDialog
          reward={confirmReward}
          totalPoints={totalPoints}
          onConfirm={handleRedeem}
          onCancel={() => setConfirmReward(null)}
          redeeming={redeeming}
        />
      )}
    </>
  );
}
