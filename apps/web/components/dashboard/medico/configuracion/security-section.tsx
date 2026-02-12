"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Badge } from "@red-salud/ui";
import { toast } from "sonner";
import {
  Shield,
  Key,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
  Trash2,
  AlertCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  generateTwoFactorSecretAction,
  verifyAndEnableTwoFactorAction,
  disableTwoFactorAction,
  verifyTwoFactorForAction
} from "@/lib/actions/security";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@red-salud/ui";

export function SecuritySection() {
  const router = useRouter();
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Deletion State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0: Idle, 1: 2FA, 2: Password, 3: Phrase
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleteOTP, setDeleteOTP] = useState("");
  const [verifyingStep, setVerifyingStep] = useState(false);

  const [profile, setProfile] = useState<{ scheduled_deletion_at: string | null; deletion_initiated_at: string | null; email: string | null; two_factor_enabled: boolean | null } | null>(null);
  const [cancellingDeletion, setCancellingDeletion] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setup2FAData, setSetup2FAData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('scheduled_deletion_at, deletion_initiated_at, email, two_factor_enabled')
          .eq('id', user.id)
          .single();
        setProfile(data);
        setIs2FAEnabled(data?.two_factor_enabled || false);
      }
    };
    loadProfile();
  }, []);

  const handleStart2FASetup = async () => {
    try {
      const result = await generateTwoFactorSecretAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSetup2FAData(result as { secret: string; qrCodeUrl: string });
      setShow2FASetup(true);
    } catch (error) {
      console.error("Error starting 2FA setup:", error);
      toast.error("Error al iniciar configuración 2FA");
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || !setup2FAData) return;

    setIsVerifying2FA(true);
    try {
      const result = await verifyAndEnableTwoFactorAction(setup2FAData.secret, verificationCode);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Autenticación de dos factores activada");
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setSetup2FAData(null);
      setVerificationCode("");
    } catch {
      toast.error("Error al verificar código");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("¿Estás seguro de desactivar la autenticación de dos factores? Esto reducirá la seguridad de tu cuenta.")) return;

    try {
      const result = await disableTwoFactorAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("2FA desactivado correctamente");
      setIs2FAEnabled(false);
    } catch {
      toast.error("Error al desactivar 2FA");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Por favor ingresa tu contraseña actual");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setChangingPassword(true);
    try {
      // 1. Verificar contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }

      // 2. Actualizar contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error al cerrar sesión");
    } finally {
      setLoggingOut(false);
    }
  };

  const startDeletionFlow = () => {
    setShowDeleteDialog(true);
    setDeleteStep(is2FAEnabled ? 1 : 2);
    setDeleteOTP("");
    setDeletePassword("");
    setDeletePhrase("");
  };

  const verifyDeleteOTP = async () => {
    if (deleteOTP.length !== 6) return;
    setVerifyingStep(true);
    try {
      const result = await verifyTwoFactorForAction(deleteOTP);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDeleteStep(2); // Move to Password
    } finally {
      setVerifyingStep(false);
    }
  };

  const verifyDeletePassword = async () => {
    if (!profile?.email || !deletePassword) return;
    setVerifyingStep(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: deletePassword,
      });

      if (error) {
        toast.error("Contraseña incorrecta");
        return;
      }
      setDeleteStep(3); // Move to Phrase
    } finally {
      setVerifyingStep(false);
    }
  };

  const confirmFinalDeletion = async () => {
    if (deletePhrase !== "borra cuenta") {
      toast.error("Frase incorrecta");
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc('initiate_user_deletion');
      if (error) throw error;

      toast.success("Eliminación iniciada. Tu cuenta se borrará en 90 días.");

      // Update local state
      const { data } = await supabase
        .from('profiles')
        .select('scheduled_deletion_at, deletion_initiated_at, email, two_factor_enabled')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      setProfile(data);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Error al iniciar la eliminación");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancellingDeletion(true);
    try {
      const { error } = await supabase.rpc('cancel_user_deletion');
      if (error) throw error;

      toast.success("Eliminación cancelada correctamente");

      // Recargar perfil
      const { data } = await supabase
        .from('profiles')
        .select('scheduled_deletion_at, deletion_initiated_at, email, two_factor_enabled')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      console.error("Error cancelling deletion:", error);
      toast.error("Error al cancelar la eliminación");
    } finally {
      setCancellingDeletion(false);
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
            <Label htmlFor="current-pass">Contraseña Actual *</Label>
            <Input
              id="current-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

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
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${is2FAEnabled ? 'bg-green-100' : 'bg-purple-100'}`}>
              <Smartphone className={`h-5 w-5 ${is2FAEnabled ? 'text-green-600' : 'text-purple-600'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  Autenticación de Dos Factores
                </h3>
                {is2FAEnabled ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activado</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">Desactivado</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Agrega una capa extra de seguridad a tu cuenta mediante Google Authenticator
              </p>
            </div>
          </div>

          {is2FAEnabled && (
            <Button variant="outline" onClick={handleDisable2FA} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              Desactivar
            </Button>
          )}
        </div>

        {!is2FAEnabled && !show2FASetup && (
          <Button onClick={handleStart2FASetup} className="w-full sm:w-auto">
            <Shield className="h-4 w-4 mr-2" />
            Configurar 2FA
          </Button>
        )}

        {show2FASetup && setup2FAData && (
          <div className="bg-gray-50 border rounded-lg p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">1. Escanea el código QR</h4>
                <p className="text-sm text-gray-600">
                  Abre tu aplicación de autenticación (Google Authenticator, Authy) y escanea este código.
                </p>
                <div className="bg-white p-4 rounded-lg border w-fit mx-auto md:mx-0">
                  <Image src={setup2FAData.qrCodeUrl} alt="QR Code" width={192} height={192} className="w-48 h-48" />
                </div>
                <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded text-center break-all">
                  {setup2FAData.secret}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">2. Ingresa el código</h4>
                <p className="text-sm text-gray-600">
                  Ingresa el código de 6 dígitos que aparece en tu aplicación.
                </p>
                <div className="space-y-2">
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest h-14 font-mono"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShow2FASetup(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleVerify2FA}
                    disabled={verificationCode.length !== 6 || isVerifying2FA}
                    className="flex-1"
                  >
                    {isVerifying2FA ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Activar 2FA"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* Account Actions */}
      <div className={`border rounded-lg p-6 ${profile?.scheduled_deletion_at ? 'border-orange-200 bg-orange-50/50' : 'border-red-200 bg-red-50/50'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${profile?.scheduled_deletion_at ? 'bg-orange-100' : 'bg-red-100'}`}>
            <AlertCircle className={`h-5 w-5 ${profile?.scheduled_deletion_at ? 'text-orange-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Acciones de Cuenta</h3>
            <p className="text-sm text-gray-600">
              Gestiona tu sesión y cuenta
            </p>
          </div>
        </div>

        <div className="space-y-4">
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

          {profile?.scheduled_deletion_at ? (
            <div className="space-y-4">
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Eliminación Programada
                </p>
                <p className="text-xs text-orange-800">
                  Tu cuenta está programada para eliminarse el:
                  <span className="font-bold ml-1">
                    {new Date(profile.scheduled_deletion_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
                <p className="text-xs text-orange-700 mt-2 italic">
                  Todos tus datos se mantienen respaldados hasta esa fecha. Puedes cancelar el proceso en cualquier momento antes de que expire el plazo.
                </p>
              </div>
              <Button
                onClick={handleCancelDeletion}
                disabled={cancellingDeletion}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {cancellingDeletion ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Eliminación Programada
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={startDeletionFlow}
                disabled={deletingAccount}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cuenta
              </Button>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar Cuenta</DialogTitle>
                    <DialogDescription>
                      Estás a punto de iniciar el proceso de eliminación. Sigue los pasos de seguridad.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Stepper Visualization */}
                    <div className="flex items-center justify-between px-2 mb-6">
                      {[
                        { step: 1, icon: Smartphone, show: is2FAEnabled },
                        { step: 2, icon: Lock, show: true },
                        { step: 3, icon: Trash2, show: true }
                      ].filter(s => s.show).map((s, idx, arr) => {
                        const isActive = deleteStep === s.step;
                        const isPast = deleteStep > s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-red-600 bg-red-50 text-red-600' :
                              isPast ? 'border-green-600 bg-green-50 text-green-600' :
                                'border-gray-200 text-gray-400'
                              }`}>
                              <s.icon className="h-5 w-5" />
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`absolute top-5 left-10 h-[2px] -z-10 ${isPast ? 'bg-green-600' : 'bg-gray-200'
                                }`} style={{ width: 'calc(100% + 2rem)' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 1: 2FA */}
                    {deleteStep === 1 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                          <h4 className="font-medium">Verificación de 2FA</h4>
                          <p className="text-sm text-gray-500">Ingresa el código de tu autenticador</p>
                        </div>
                        <Input
                          value={deleteOTP}
                          onChange={(e) => setDeleteOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="text-center text-2xl tracking-widest h-14 font-mono"
                          maxLength={6}
                          autoFocus
                        />
                        <Button onClick={verifyDeleteOTP} disabled={deleteOTP.length !== 6 || verifyingStep} className="w-full">
                          {verifyingStep ? <Loader2 className="animate-spin" /> : "Verificar y Continuar"}
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Password */}
                    {deleteStep === 2 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                          <h4 className="font-medium">Confirmar Contraseña</h4>
                          <p className="text-sm text-gray-500">Ingresa tu contraseña actual para continuar</p>
                        </div>
                        <Input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Contraseña actual"
                          autoFocus
                        />
                        <Button onClick={verifyDeletePassword} disabled={!deletePassword || verifyingStep} className="w-full">
                          {verifyingStep ? <Loader2 className="animate-spin" /> : "Verificar y Continuar"}
                        </Button>
                      </div>
                    )}

                    {/* Step 3: Phrase */}
                    {deleteStep === 3 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                          <p className="text-sm text-red-800 font-medium text-center">
                            Esta acción iniciará el periodo de espera de 90 días.
                          </p>
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-red-600">Confirmación Final</h4>
                          <p className="text-sm text-gray-500">
                            Escribe <span className="font-bold text-gray-900">borra cuenta</span> para confirmar.
                          </p>
                        </div>
                        <Input
                          value={deletePhrase}
                          onChange={(e) => setDeletePhrase(e.target.value)}
                          placeholder="borra cuenta"
                          className="text-center"
                          autoFocus
                        />
                        <Button
                          variant="destructive"
                          onClick={confirmFinalDeletion}
                          disabled={deletePhrase !== "borra cuenta" || deletingAccount}
                          className="w-full"
                        >
                          {deletingAccount ? <Loader2 className="animate-spin" /> : "Confirmar Eliminación"}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
