"use client";

import { Card, CardContent } from "@red-salud/ui";
import { Pill, Sparkles, Zap, Bell, FileText } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorRecetasMockPage() {
  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="max-w-2xl w-full border-2 border-emerald-100 shadow-xl">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg">
                    <Pill className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-bounce" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    Recetas Médicas
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">
                    Próximamente disponible
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                  Estamos construyendo un sistema de recetas electrónicas inteligente,
                  con vademécum integrado y firma digital segura.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                    <FileText className="h-8 w-8 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-700">Digital</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                    <Bell className="h-8 w-8 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-700">Notificaciones</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                    <Zap className="h-8 w-8 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-700">Instantáneo</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    En desarrollo activo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VerificationGuard>
  );
}
