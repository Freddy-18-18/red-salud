"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { VerificationResult } from "./hooks/useProfileSetup";

interface Props {
  cedula: string;
  tipoDocumento: "V" | "E";
  verificationResult: VerificationResult | null;
  verifying: boolean;
  onCedulaChange: (v: string) => void;
  onTipoChange: (v: "V" | "E") => void;
  onVerify: () => void;
  onContinue: () => void;
}

export function VerificationSection({
  cedula,
  tipoDocumento,
  verificationResult,
  verifying,
  onCedulaChange,
  onTipoChange,
  onVerify,
  onContinue,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Verificación SACS</CardTitle>
            <CardDescription>Verifica tu identidad como profesional de la salud en Venezuela</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoDocumento} onValueChange={(v) => onTipoChange(v as "V" | "E")}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="V">V</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label htmlFor="cedula">Número de Cédula</Label>
              <Input
                id="cedula"
                type="text"
                placeholder="12345678"
                value={cedula}
                onChange={(e) => onCedulaChange(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                disabled={verifying || !!verificationResult?.verified}
              />
            </div>
          </div>

          <Button onClick={onVerify} disabled={verifying || !cedula || !!verificationResult?.verified} className="w-full" size="lg">
            {verifying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />Verificando con SACS...
              </>
            ) : verificationResult?.verified ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />Verificado Exitosamente
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />Verificar con SACS
              </>
            )}
          </Button>
        </div>

        {verificationResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {verificationResult.verified ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-semibold text-green-900">¡Verificación Exitosa!</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium text-gray-900">{verificationResult.data?.nombre_completo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profesión:</span>
                        <span className="font-medium text-gray-900">{verificationResult.data?.profesion_principal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Matrícula:</span>
                        <span className="font-medium text-gray-900">{verificationResult.data?.matricula_principal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Especialidad:</span>
                        <span className="font-medium text-gray-900">{verificationResult.data?.especialidad_display}</span>
                      </div>
                      {verificationResult.data?.tiene_postgrados && (
                        <Badge className="bg-purple-100 text-purple-800">Con Postgrados</Badge>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Verificación Fallida</p>
                  <p className="text-sm">{verificationResult.message}</p>
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}

        {verificationResult?.verified && (
          <Button onClick={onContinue} className="w-full" size="lg">
            Continuar
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

