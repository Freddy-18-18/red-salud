"use client";

import { Card, CardContent } from "@red-salud/design-system";
import { Video, Sparkles, Clock, Shield } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorTelemedicineaPage() {
  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="max-w-2xl w-full border-2 border-blue-100 shadow-xl">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg">
                    <Video className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-bounce" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Telemedicina
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">
                    Próximamente disponible
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                  Estamos desarrollando una experiencia de videoconsulta de última generación 
                  para que puedas atender a tus pacientes de forma remota con la mejor calidad.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Video className="h-8 w-8 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">HD Video</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">Seguro</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">24/7</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
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
