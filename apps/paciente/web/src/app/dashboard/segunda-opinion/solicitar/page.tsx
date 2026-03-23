"use client";

import { ArrowLeft } from "lucide-react";
import { RequestFlow } from "@/components/second-opinion/request-flow";

export default function SolicitarSegundaOpinionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard/segunda-opinion"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Solicitar Segunda Opinion
          </h1>
          <p className="text-gray-500 mt-0.5">
            Completa los pasos para solicitar una revision de tu diagnostico
          </p>
        </div>
      </div>

      {/* Flow */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8">
        <RequestFlow />
      </div>
    </div>
  );
}
