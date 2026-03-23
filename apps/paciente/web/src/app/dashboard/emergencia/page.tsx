"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useEmergency } from "@/hooks/use-emergency";
import { StepWho } from "@/components/emergency/step-who";
import { StepPriority } from "@/components/emergency/step-priority";
import { StepLocation } from "@/components/emergency/step-location";
import { StepRequesting } from "@/components/emergency/step-requesting";
import { StepTracking } from "@/components/emergency/step-tracking";
import { MedicalIdCard } from "@/components/emergency/medical-id-card";

export default function EmergenciaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    load();
  }, []);

  const emergency = useEmergency(userId);

  // Auto-start the emergency flow when the page loads
  useEffect(() => {
    if (userId && emergency.step === "idle") {
      emergency.startEmergency();
    }
  }, [userId, emergency.step]);

  const renderStep = () => {
    switch (emergency.step) {
      case "idle":
        return null; // Will auto-advance

      case "who":
        return (
          <StepWho
            familyMembers={emergency.familyMembers}
            onSelect={emergency.selectPerson}
          />
        );

      case "priority":
        return (
          <StepPriority
            onSelect={emergency.selectPriority}
            onBack={() => emergency.setStep("who")}
          />
        );

      case "location":
        return (
          <StepLocation
            initialLocation={emergency.location}
            onConfirm={emergency.confirmLocation}
            onSubmit={emergency.submitRequest}
            onBack={() => emergency.setStep("priority")}
            loading={emergency.loading}
          />
        );

      case "requesting":
        return (
          <StepRequesting
            medicalSummary={emergency.medicalSummary}
            error={emergency.error}
          />
        );

      case "tracking":
        return emergency.activeRequest ? (
          <StepTracking
            request={emergency.activeRequest}
            medicalSummary={emergency.medicalSummary}
            onCancel={emergency.cancelRequest}
            loading={emergency.loading}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Progress bar steps
  const flowSteps = ["who", "priority", "location"];
  const currentFlowIndex = flowSteps.indexOf(emergency.step);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {emergency.step === "who" || emergency.step === "idle" ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        ) : null}

        <div className="flex-1">
          <h1 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergencia
          </h1>
        </div>

        <a
          href="/dashboard/emergencia/historial"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          Historial
        </a>
      </div>

      {/* Progress bar (only during the form steps) */}
      {currentFlowIndex >= 0 && (
        <div className="flex gap-1.5 mb-6">
          {flowSteps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentFlowIndex ? "bg-red-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Error banner */}
      {emergency.error &&
        emergency.step !== "requesting" &&
        emergency.step !== "tracking" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{emergency.error}</p>
          </div>
        )}

      {/* Step content */}
      {renderStep()}

      {/* Quick access: Medical ID */}
      {emergency.medicalSummary &&
        !["requesting", "tracking"].includes(emergency.step) && (
          <details className="mt-8 group">
            <summary className="text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1 transition-colors">
              Ver mi ID médico
              <span className="ml-auto text-xs text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3">
              <MedicalIdCard summary={emergency.medicalSummary} />
            </div>
          </details>
        )}
    </div>
  );
}
