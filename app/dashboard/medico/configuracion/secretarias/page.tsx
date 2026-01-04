"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

// Components
import { SecretaryList } from "@/components/configuracion/secretarias/secretary-list";
import { InviteDialog } from "@/components/configuracion/secretarias/invite-dialog";
import { PermissionsDialog } from "@/components/configuracion/secretarias/permissions-dialog";
import { Secretary } from "@/components/configuracion/secretarias/types";

export default function SecretariasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSecretaries();
  }, []);

  const loadSecretaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      const { data, error } = await supabase
        .from("doctor_secretary_relationships")
        .select("*")
        .eq("doctor_id", user.id);

      if (error) throw error;

      setSecretaries(data || []);
    } catch (err: any) {
      console.error("Error loading secretaries:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSecretary = async (inviteForm: any) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: inviteForm.email,
        password: inviteForm.password,
        email_confirm: true,
        user_metadata: {
          nombre_completo: inviteForm.nombre_completo,
          role: "secretaria",
        },
      });

      if (authError) throw authError;

      // 2. Crear perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: inviteForm.email,
          nombre_completo: inviteForm.nombre_completo,
          role: "secretaria",
        });

      if (profileError) throw profileError;

      // 3. Crear relación médico-secretaria
      const { error: relationError } = await supabase
        .from("doctor_secretaries")
        .insert({
          doctor_id: user.id,
          secretary_id: authData.user.id,
          status: "active",
        });

      if (relationError) throw relationError;

      setSuccess("Secretaria invitada exitosamente");
      setShowInviteDialog(false);
      loadSecretaries();
    } catch (err: any) {
      console.error("Error inviting secretary:", err);
      setError(err.message || "Error al invitar secretaria");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedSecretary) return;

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase
        .from("doctor_secretaries")
        .update({ permissions: selectedSecretary.permissions })
        .eq("id", selectedSecretary.id);

      if (error) throw error;

      setSuccess("Permisos actualizados exitosamente");
      setShowPermissionsDialog(false);
      loadSecretaries();
    } catch (err: any) {
      console.error("Error updating permissions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSecretary = async (secretaryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta secretaria?")) return;

    try {
      const { error } = await supabase
        .from("doctor_secretaries")
        .delete()
        .eq("id", secretaryId);

      if (error) throw error;

      setSuccess("Secretaria eliminada exitosamente");
      loadSecretaries();
    } catch (err: any) {
      console.error("Error deleting secretary:", err);
      setError(err.message);
    }
  };

  const togglePermission = (key: keyof Secretary["permissions"]) => {
    if (!selectedSecretary) return;
    setSelectedSecretary({
      ...selectedSecretary,
      permissions: {
        ...selectedSecretary.permissions,
        [key]: !selectedSecretary.permissions[key],
      },
    });
  };

  if (loading && secretaries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Secretarias</h1>
            <p className="text-gray-600 mt-1">
              Invita y gestiona el acceso de tus secretarias
            </p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Secretaria
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <SecretaryList
          secretaries={secretaries}
          onInvite={() => setShowInviteDialog(true)}
          onEditPermissions={(secretary) => {
            setSelectedSecretary(secretary);
            setShowPermissionsDialog(true);
          }}
          onDelete={handleDeleteSecretary}
        />

        <InviteDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onInvite={handleInviteSecretary}
          loading={loading}
        />

        <PermissionsDialog
          open={showPermissionsDialog}
          onOpenChange={setShowPermissionsDialog}
          secretary={selectedSecretary}
          onUpdate={handleUpdatePermissions}
          onTogglePermission={togglePermission}
          loading={loading}
        />
      </div>
    </VerificationGuard>
  );
}
