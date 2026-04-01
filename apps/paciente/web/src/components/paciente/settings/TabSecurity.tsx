"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Badge,
  Switch,
} from "@red-salud/design-system";
import {
  Loader2,
  Save,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  QrCode,
  Phone,
  CreditCard,
  Monitor,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface TabSecurityProps {
  saving: boolean;
  onChangePassword: (newPassword: string) => void;
}

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "weak";
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: "Debil", color: "bg-red-500", width: "w-1/3" },
  medium: { label: "Media", color: "bg-yellow-500", width: "w-2/3" },
  strong: { label: "Fuerte", color: "bg-green-500", width: "w-full" },
};

type EnrollStep = "idle" | "setup" | "verify" | "backup" | "enabled";
type CedulaStep = "input" | "confirming" | "verified";

interface CneData {
  nacionalidad: string;
  cedula: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string;
  cne_estado: string | null;
  cne_municipio: string | null;
  cne_parroquia: string | null;
}

interface DeviceInfo {
  browser: string;
  os: string;
  isMobile: boolean;
}

function parseUserAgent(ua: string): DeviceInfo {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let browser = "Navegador desconocido";
  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";
  else if (ua.includes("Firefox/")) browser = "Firefox";

  let os = "Sistema desconocido";
  if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os, isMobile };
}

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    codes.push(`${segment1}-${segment2}`);
  }
  return codes;
}

export function TabSecurity({ saving, onChangePassword }: TabSecurityProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [enrollStep, setEnrollStep] = useState<EnrollStep>("idle");
  const [totpUri, setTotpUri] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Phone verification state
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);

  // Cedula verification state
  const [cedulaStep, setCedulaStep] = useState<CedulaStep>("input");
  const [nacionalidad, setNacionalidad] = useState<"V" | "E">("V");
  const [cedulaNumber, setCedulaNumber] = useState("");
  const [cneData, setCneData] = useState<CneData | null>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);
  const [cedulaLoading, setCedulaLoading] = useState(false);
  const [verifiedCedula, setVerifiedCedula] = useState<{
    number: string;
    nacionalidad: string;
  } | null>(null);

  // Active sessions state
  const [currentSession, setCurrentSession] = useState<Awaited<
    ReturnType<typeof supabase.auth.getSession>
  >["data"]["session"]>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsMessage, setSessionsMessage] = useState<string | null>(null);

  // ── Init: load existing 2FA, phone, cedula, session ──────────────────
  useEffect(() => {
    (async () => {
      // 2FA: check if already enrolled
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      if (mfaData?.totp?.length) {
        const active = mfaData.totp.find((f) => f.status === "verified");
        if (active) {
          setTwoFactorEnabled(true);
          setEnrollStep("enabled");
          setFactorId(active.id);
        }
      }

      // Phone
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.phone) {
        setUserPhone(userData.user.phone);
        setPhoneVerified(!!userData.user.phone_confirmed_at);
      }

      // Cedula: check profile
      const profile = userData.user?.user_metadata;
      if (profile?.cedula_verified) {
        setCedulaStep("verified");
        setVerifiedCedula({
          number: profile.cedula_number,
          nacionalidad: profile.cedula_nacionalidad,
        });
      }

      // Session + device info
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentSession(sessionData.session);
      if (typeof navigator !== "undefined") {
        setDeviceInfo(parseUserAgent(navigator.userAgent));
      }
    })();
  }, []);

  // Countdown timer for phone OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ── 2FA handlers ──────────────────────────────────────────────────────
  const handleTwoFactorToggle = useCallback(async (enabled: boolean) => {
    setTwoFactorError(null);
    if (!enabled) {
      // Unenroll
      setTwoFactorLoading(true);
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) throw error;
        setTwoFactorEnabled(false);
        setEnrollStep("idle");
        setTotpUri("");
        setFactorId("");
        setVerifyCode("");
        setBackupCodes([]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error al desactivar 2FA";
        setTwoFactorError(msg);
      } finally {
        setTwoFactorLoading(false);
      }
      return;
    }

    // Start enrollment
    setTwoFactorLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Red Salud TOTP",
      });
      if (error) throw error;
      setTotpUri(data.totp.uri);
      setFactorId(data.id);
      setEnrollStep("setup");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al iniciar 2FA";
      setTwoFactorError(msg);
    } finally {
      setTwoFactorLoading(false);
    }
  }, [factorId]);

  const handleVerify2FA = useCallback(async () => {
    if (verifyCode.length !== 6) {
      setTwoFactorError("El codigo debe tener 6 digitos");
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });
      if (error) throw error;
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      setEnrollStep("backup");
      setTwoFactorEnabled(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Codigo invalido. Intenta de nuevo.";
      setTwoFactorError(msg);
    } finally {
      setTwoFactorLoading(false);
    }
  }, [factorId, verifyCode]);

  const handleCopyBackupCodes = useCallback(() => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  }, [backupCodes]);

  // ── Phone verification handlers ──────────────────────────────────────
  const handleSendPhoneOtp = useCallback(async () => {
    if (!userPhone) return;
    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneSuccess(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: userPhone });
      if (error) throw error;
      setPhoneOtpSent(true);
      setResendCountdown(60);
      setPhoneSuccess("Codigo enviado por SMS");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al enviar el codigo";
      setPhoneError(msg);
    } finally {
      setPhoneLoading(false);
    }
  }, [userPhone]);

  const handleVerifyPhoneOtp = useCallback(async () => {
    if (!userPhone || phoneOtpCode.length !== 6) {
      setPhoneError("El codigo debe tener 6 digitos");
      return;
    }
    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneSuccess(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: userPhone,
        token: phoneOtpCode,
        type: "sms",
      });
      if (error) throw error;
      setPhoneVerified(true);
      setPhoneOtpSent(false);
      setPhoneOtpCode("");
      setPhoneSuccess("Telefono verificado correctamente");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Codigo invalido";
      setPhoneError(msg);
    } finally {
      setPhoneLoading(false);
    }
  }, [phoneOtpCode, userPhone]);

  // ── Cedula verification handlers ─────────────────────────────────────
  const handleVerifyCedula = useCallback(async () => {
    const cleanCedula = cedulaNumber.replace(/\D/g, "");
    if (cleanCedula.length < 6 || cleanCedula.length > 9) {
      setCedulaError("La cedula debe tener entre 6 y 9 digitos");
      return;
    }
    setCedulaLoading(true);
    setCedulaError(null);
    try {
      const res = await fetch("/api/verify-cedula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nacionalidad, cedula: cleanCedula }),
      });
      const json = await res.json();
      if (json.error) {
        setCedulaError(json.message || "Error al verificar cedula");
        return;
      }
      setCneData(json.data);
      setCedulaStep("confirming");
    } catch {
      setCedulaError("Error de conexion. Intenta de nuevo.");
    } finally {
      setCedulaLoading(false);
    }
  }, [cedulaNumber, nacionalidad]);

  const handleConfirmCedula = useCallback(async () => {
    if (!cneData) return;
    setCedulaLoading(true);
    setCedulaError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          cedula_verified: true,
          cedula_number: cneData.cedula,
          cedula_nacionalidad: cneData.nacionalidad,
        },
      });
      if (error) throw error;
      setVerifiedCedula({ number: cneData.cedula, nacionalidad: cneData.nacionalidad });
      setCedulaStep("verified");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar la verificacion";
      setCedulaError(msg);
    } finally {
      setCedulaLoading(false);
    }
  }, [cneData]);

  // ── Sessions handlers ────────────────────────────────────────────────
  const handleSignOutOtherSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsMessage(null);
    try {
      await supabase.auth.signOut({ scope: "others" });
      setSessionsMessage("Se cerraron todas las sesiones en otros dispositivos");
    } catch {
      setSessionsMessage("Error al cerrar las otras sesiones");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const strengthInfo = strengthConfig[strength];

  const handleChangePassword = () => {
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("La contrasena debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contrasenas no coinciden");
      return;
    }

    onChangePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar contrasena
          </CardTitle>
          <CardDescription>
            Elige una contrasena segura de al menos 8 caracteres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimo 8 caracteres"
                  className="pr-10 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`}
                    />
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Seguridad: {strengthInfo.label}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contrasena</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contrasena"
                  className="pr-10 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          {passwordError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={saving || !newPassword}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cambiar contrasena
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Autenticacion de dos factores (2FA)
            {twoFactorEnabled && (
              <Badge className="gap-1 text-xs bg-green-500 text-white">
                <Check className="h-3 w-3" />
                Activo
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Agrega una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Autenticacion TOTP
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Usa una app como Google Authenticator
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
              disabled={twoFactorLoading || enrollStep === "verify" || enrollStep === "backup"}
            />
          </div>

          {/* Setup: show TOTP URI */}
          {enrollStep === "setup" && (
            <div className="space-y-3 p-4 border border-[hsl(var(--border))] rounded-lg">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-[hsl(var(--foreground))]" />
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Escanea este codigo con tu app de autenticacion
                </p>
              </div>
              <div className="p-3 bg-[hsl(var(--muted))] rounded break-all">
                <p className="text-xs font-mono text-[hsl(var(--muted-foreground))] select-all">
                  {totpUri}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totp-code">Codigo de verificacion (6 digitos)</Label>
                <div className="flex gap-2">
                  <Input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                  />
                  <Button onClick={handleVerify2FA} disabled={twoFactorLoading || verifyCode.length !== 6}>
                    {twoFactorLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup codes */}
          {enrollStep === "backup" && backupCodes.length > 0 && (
            <div className="space-y-3 p-4 border border-[hsl(var(--border))] rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Codigos de respaldo
                </p>
                <Button variant="outline" size="sm" onClick={handleCopyBackupCodes}>
                  {copiedCodes ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copiedCodes ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Guarda estos codigos en un lugar seguro. Cada uno puede usarse una vez.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <div
                    key={code}
                    className="p-2 bg-[hsl(var(--muted))] rounded text-center font-mono text-sm text-[hsl(var(--foreground))]"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnrollStep("enabled")}
                className="w-full"
              >
                He guardado mis codigos
              </Button>
            </div>
          )}

          {/* Enabled state */}
          {enrollStep === "enabled" && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                2FA esta activado. Tu cuenta esta protegida.
              </p>
            </div>
          )}

          {/* Error */}
          {twoFactorError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{twoFactorError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Verificacion de telefono
            {phoneVerified && (
              <Badge className="gap-1 text-xs bg-green-500 text-white">
                <Check className="h-3 w-3" />
                Verificado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Verifica tu numero de telefono para mayor seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {userPhone || "Sin numero registrado"}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {phoneVerified ? "Numero verificado" : "Numero no verificado"}
                </p>
              </div>
            </div>
            {!phoneVerified && userPhone && !phoneOtpSent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendPhoneOtp}
                disabled={phoneLoading}
              >
                {phoneLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Enviar codigo
              </Button>
            )}
          </div>

          {/* OTP input */}
          {phoneOtpSent && (
            <div className="space-y-3 p-4 border border-[hsl(var(--border))] rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Ingresa el codigo de 6 digitos enviado a {userPhone}
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={phoneOtpCode}
                  onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                />
                <Button onClick={handleVerifyPhoneOtp} disabled={phoneLoading || phoneOtpCode.length !== 6}>
                  {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSendPhoneOtp}
                disabled={resendCountdown > 0 || phoneLoading}
              >
                {resendCountdown > 0
                  ? `Reenviar en ${resendCountdown}s`
                  : "Reenviar codigo"}
              </Button>
            </div>
          )}

          {/* Messages */}
          {phoneSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4 shrink-0" />
              <span>{phoneSuccess}</span>
            </div>
          )}
          {phoneError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{phoneError}</span>
            </div>
          )}

          {!userPhone && (
            <div className="flex items-center gap-3 p-4 bg-[hsl(var(--muted))] rounded-lg">
              <AlertCircle className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No tienes un numero de telefono registrado. Actualiza tu perfil para agregar uno.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cedula verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Verificacion de cedula
            {cedulaStep === "verified" && (
              <Badge className="gap-1 text-xs bg-green-500 text-white">
                <Check className="h-3 w-3" />
                Verificada
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Verifica tu identidad con tu cedula de identidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verified state */}
          {cedulaStep === "verified" && verifiedCedula && (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Cedula verificada
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                    {verifiedCedula.nacionalidad}-{verifiedCedula.number.replace(/(\d)(?=(\d{3})+$)/g, "$1.")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input state */}
          {cedulaStep === "input" && (
            <div className="space-y-3 p-4 border border-[hsl(var(--border))] rounded-lg">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <select
                    id="nacionalidad"
                    value={nacionalidad}
                    onChange={(e) => setNacionalidad(e.target.value as "V" | "E")}
                    className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cedula-number">Numero de cedula</Label>
                  <Input
                    id="cedula-number"
                    type="text"
                    inputMode="numeric"
                    value={cedulaNumber}
                    onChange={(e) => setCedulaNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678"
                    className="border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                  />
                </div>
              </div>
              <Button
                onClick={handleVerifyCedula}
                disabled={cedulaLoading || cedulaNumber.length < 6}
              >
                {cedulaLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
            </div>
          )}

          {/* Confirming state */}
          {cedulaStep === "confirming" && cneData && (
            <div className="space-y-3 p-4 border border-[hsl(var(--border))] rounded-lg">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                Confirma que estos datos son tuyos:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-[hsl(var(--muted))] rounded">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Nombre</span>
                  <p className="text-[hsl(var(--foreground))]">
                    {cneData.primer_nombre} {cneData.segundo_nombre || ""}
                  </p>
                </div>
                <div className="p-2 bg-[hsl(var(--muted))] rounded">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Apellido</span>
                  <p className="text-[hsl(var(--foreground))]">
                    {cneData.primer_apellido} {cneData.segundo_apellido}
                  </p>
                </div>
                <div className="p-2 bg-[hsl(var(--muted))] rounded">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Cedula</span>
                  <p className="font-mono text-[hsl(var(--foreground))]">
                    {cneData.nacionalidad}-{cneData.cedula}
                  </p>
                </div>
                {cneData.cne_estado && (
                  <div className="p-2 bg-[hsl(var(--muted))] rounded">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Estado</span>
                    <p className="text-[hsl(var(--foreground))]">{cneData.cne_estado}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConfirmCedula} disabled={cedulaLoading}>
                  {cedulaLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Confirmar mis datos"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCedulaStep("input");
                    setCneData(null);
                  }}
                  disabled={cedulaLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {cedulaError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cedulaError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sesiones activas
          </CardTitle>
          <CardDescription>
            Gestiona tus sesiones activas en otros dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current session */}
          {currentSession && deviceInfo && (
            <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="flex items-center gap-3">
                {deviceInfo.isMobile ? (
                  <Smartphone className="h-5 w-5 text-[hsl(var(--foreground))] shrink-0" />
                ) : (
                  <Monitor className="h-5 w-5 text-[hsl(var(--foreground))] shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {deviceInfo.browser} en {deviceInfo.os}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Inicio: {new Date(currentSession.user.last_sign_in_at ?? "").toLocaleDateString("es-VE")}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Este dispositivo
              </Badge>
            </div>
          )}

          {/* Sign out others */}
          <Button
            variant="outline"
            onClick={handleSignOutOtherSessions}
            disabled={sessionsLoading}
          >
            {sessionsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesiones...
              </>
            ) : (
              "Cerrar todas las demas sesiones"
            )}
          </Button>

          {/* Status message */}
          {sessionsMessage && (
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Check className="h-4 w-4 shrink-0" />
              <span>{sessionsMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
