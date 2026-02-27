"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@red-salud/design-system";
import {
  LogOut,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface PrivacySettings {
  publicProfile?: boolean;
  showInDirectory?: boolean;
}

interface PrivacyCardProps {
  privacy: PrivacySettings;
  setPrivacy: (p: PrivacySettings) => void;
}

export function PrivacyCard({ privacy, setPrivacy }: PrivacyCardProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error al cerrar sesión");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      alert("Cuenta eliminada correctamente");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error al eliminar la cuenta. Por favor contacta al soporte.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Configuración de Privacidad</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Perfil visible públicamente</p>
              <p className="text-xs text-gray-500">Permite que otros usuarios vean tu perfil</p>
            </div>
            <input
              type="checkbox"
              checked={privacy?.publicProfile || false}
              onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Mostrar en directorio</p>
              <p className="text-xs text-gray-500">Aparecer en búsqueda de profesionales</p>
            </div>
            <input
              type="checkbox"
              checked={privacy?.showInDirectory || false}
              onChange={(e) => setPrivacy({ ...privacy, showInDirectory: e.target.checked })}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Acciones de Cuenta</h3>
            <p className="text-sm text-gray-600">
              Gestiona tu sesión y cuenta
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="w-full"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </>
            )}
          </Button>

          {!showDeleteConfirmation ? (
            <Button
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={deletingAccount}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cuenta
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  ⚠️ ¿Estás seguro de eliminar tu cuenta?
                </p>
                <p className="text-xs text-red-800">
                  Esta acción es irreversible. Se eliminarán todos tus datos, historial médico y configuraciones.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDeleteConfirmation(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  variant="destructive"
                  className="flex-1"
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Confirmar Eliminación
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
