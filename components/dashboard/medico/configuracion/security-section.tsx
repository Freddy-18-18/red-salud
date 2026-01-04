"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function SecuritySection() {
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Tu cuenta está protegida
            </h3>
            <p className="text-sm text-gray-600">
              Mantén tu información segura siguiendo las mejores prácticas de seguridad
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
            <p className="text-sm text-gray-600">
              Actualiza tu contraseña regularmente para mayor seguridad
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={changingPassword}
            className="w-full"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Actualizar Contraseña
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Autenticación de Dos Factores
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Agrega una capa extra de seguridad a tu cuenta
              </p>
              <Badge variant="secondary" className="mt-2">
                Próximamente
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sesiones Activas</h3>
            <p className="text-sm text-gray-600">
              Gestiona los dispositivos donde has iniciado sesión
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border">
                <Smartphone className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Sesión Actual</p>
                <p className="text-xs text-gray-500">Windows • Chrome</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Activa
            </Badge>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Recomendaciones de Seguridad
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Usa una contraseña única y segura</li>
              <li>• No compartas tu contraseña con nadie</li>
              <li>• Cierra sesión en dispositivos compartidos</li>
              <li>• Revisa regularmente tu actividad de cuenta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
