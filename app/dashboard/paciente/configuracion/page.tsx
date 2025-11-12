"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Monitor,
  Save,
  Loader2,
  Camera,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useConfiguracion,
  PatientDetails,
} from "@/hooks/paciente/useConfiguracion";

export default function ConfiguracionPage() {
  const {
    loading,
    saving,
    message,
    setMessage,
    profile,
    setProfile,
    patientDetails,
    setPatientDetails,
    preferences,
    setPreferences,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    saveProfile,
    savePatientDetails,
    savePreferences,
    saveNotifications,
    savePrivacy,
  } = useConfiguracion();

  useEffect(() => {
    // Garantiza restaurar mensajes al navegar
    return () => setMessage(null);
  }, [setMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Monitor className="h-4 w-4 mr-2" />
            Médico
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Monitor className="h-4 w-4 mr-2" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        {/* Perfil Personal */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información básica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar Foto
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={profile?.nombre_completo || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, nombre_completo: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input
                    id="cedula"
                    value={profile?.cedula || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, cedula: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={profile?.telefono || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, telefono: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={profile?.fecha_nacimiento || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, fecha_nacimiento: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={profile?.ciudad || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, ciudad: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={profile?.estado || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, estado: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={profile?.codigo_postal || ""}
                    onChange={(e) =>
                      setProfile({ ...profile!, codigo_postal: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={profile?.direccion || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, direccion: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Button onClick={saveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Información Médica */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Médica</CardTitle>
              <CardDescription>
                Mantén actualizada tu información de salud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grupo_sanguineo">Grupo Sanguíneo</Label>
                  <Select
                    value={patientDetails.grupo_sanguineo || ""}
                    onValueChange={(value) =>
                      setPatientDetails({ ...patientDetails, grupo_sanguineo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    value={patientDetails.peso_kg ?? ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        peso_kg: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    value={patientDetails.altura_cm ?? ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        altura_cm: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea
                  id="alergias"
                  placeholder="Ej: Penicilina, Polen, Mariscos"
                  value={patientDetails.alergias?.join(", ") || ""}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      alergias: e.target.value.split(",").map((a) => a.trim()),
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enfermedades">Enfermedades Crónicas</Label>
                <Textarea
                  id="enfermedades"
                  placeholder="Ej: Diabetes, Hipertensión"
                  value={patientDetails.enfermedades_cronicas?.join(", ") || ""}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      enfermedades_cronicas: e.target.value
                        .split(",")
                        .map((e) => e.trim()),
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
                <Textarea
                  id="medicamentos"
                  placeholder="Lista de medicamentos que tomas actualmente"
                  value={patientDetails.medicamentos_actuales || ""}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      medicamentos_actuales: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cirugias">Cirugías Previas</Label>
                <Textarea
                  id="cirugias"
                  placeholder="Describe cirugías o procedimientos previos"
                  value={patientDetails.cirugias_previas || ""}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      cirugias_previas: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Contacto de Emergencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contacto_nombre">Nombre</Label>
                    <Input
                      id="contacto_nombre"
                      value={patientDetails.contacto_emergencia_nombre || ""}
                      onChange={(e) =>
                        setPatientDetails({
                          ...patientDetails,
                          contacto_emergencia_nombre: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto_telefono">Teléfono</Label>
                    <Input
                      id="contacto_telefono"
                      type="tel"
                      value={patientDetails.contacto_emergencia_telefono || ""}
                      onChange={(e) =>
                        setPatientDetails({
                          ...patientDetails,
                          contacto_emergencia_telefono: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto_relacion">Relación</Label>
                    <Input
                      id="contacto_relacion"
                      placeholder="Ej: Esposo/a, Hijo/a"
                      value={patientDetails.contacto_emergencia_relacion || ""}
                      onChange={(e) =>
                        setPatientDetails({
                          ...patientDetails,
                          contacto_emergencia_relacion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={savePatientDetails} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Información Médica
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferencias */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de la Aplicación</CardTitle>
              <CardDescription>
                Personaliza tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-gray-500">
                      Activa el tema oscuro de la aplicación
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.dark_mode || false}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences({ ...preferences!, dark_mode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones de Escritorio</Label>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones en tu navegador
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.desktop_notifications || false}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences({
                        ...preferences!,
                        desktop_notifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sonidos de Notificación</Label>
                    <p className="text-sm text-gray-500">
                      Reproduce sonidos para alertas
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.sound_notifications || false}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences({
                        ...preferences!,
                        sound_notifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={preferences?.language || "es"}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences!, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select
                  value={preferences?.timezone || "America/Caracas"}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences!, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Caracas">Caracas (GMT-4)</SelectItem>
                    <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                    <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                    <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_method">Método de Contacto Preferido</Label>
                <Select
                  value={preferences?.preferred_contact_method || "email"}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences!,
                      preferred_contact_method: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Suscripciones</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Boletín Informativo</Label>
                      <p className="text-sm text-gray-500">
                        Recibe noticias y consejos de salud
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.newsletter_subscribed || false}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences!,
                          newsletter_subscribed: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promociones</Label>
                      <p className="text-sm text-gray-500">
                        Ofertas especiales y descuentos
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.promotions_subscribed || false}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences!,
                          promotions_subscribed: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Encuestas</Label>
                      <p className="text-sm text-gray-500">
                        Ayúdanos a mejorar con tu opinión
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.surveys_subscribed || false}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences({
                          ...preferences!,
                          surveys_subscribed: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={savePreferences} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Preferencias
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Elige qué notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Inicio de Sesión</Label>
                  <p className="text-sm text-gray-500">
                    Notificación cuando alguien accede a tu cuenta
                  </p>
                </div>
                <Switch
                  checked={notifications?.login_alerts || false}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications!, login_alerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cambios en la Cuenta</Label>
                  <p className="text-sm text-gray-500">
                    Notificación de cambios importantes en tu cuenta
                  </p>
                </div>
                <Switch
                  checked={notifications?.account_changes || false}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications!,
                      account_changes: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de Citas</Label>
                  <p className="text-sm text-gray-500">
                    Recordatorios antes de tus citas médicas
                  </p>
                </div>
                <Switch
                  checked={notifications?.appointment_reminders || false}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications!,
                      appointment_reminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resultados de Laboratorio</Label>
                  <p className="text-sm text-gray-500">
                    Notificación cuando tus resultados estén listos
                  </p>
                </div>
                <Switch
                  checked={notifications?.lab_results || false}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications!, lab_results: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mensajes de Doctores</Label>
                  <p className="text-sm text-gray-500">
                    Notificación de nuevos mensajes de tus doctores
                  </p>
                </div>
                <Switch
                  checked={notifications?.doctor_messages || false}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications!,
                      doctor_messages: checked,
                    })
                  }
                />
              </div>

              <Button onClick={saveNotifications} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Notificaciones
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacidad */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>
                Controla quién puede ver tu información
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Perfil Público</Label>
                  <p className="text-sm text-gray-500">
                    Permite que otros usuarios vean tu perfil básico
                  </p>
                </div>
                <Switch
                  checked={privacy?.profile_public || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({ ...privacy!, profile_public: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Historial Médico</Label>
                  <p className="text-sm text-gray-500">
                    Permite que doctores accedan a tu historial
                  </p>
                </div>
                <Switch
                  checked={privacy?.share_medical_history || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({ ...privacy!, share_medical_history: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Foto de Perfil</Label>
                  <p className="text-sm text-gray-500">
                    Tu foto será visible en consultas y mensajes
                  </p>
                </div>
                <Switch
                  checked={privacy?.show_profile_photo || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({ ...privacy!, show_profile_photo: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Ubicación</Label>
                  <p className="text-sm text-gray-500">
                    Permite usar tu ubicación para servicios cercanos
                  </p>
                </div>
                <Switch
                  checked={privacy?.share_location || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({ ...privacy!, share_location: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Datos Anónimos para Investigación</Label>
                  <p className="text-sm text-gray-500">
                    Contribuye con datos anónimos para estudios médicos
                  </p>
                </div>
                <Switch
                  checked={privacy?.anonymous_data_research || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({
                      ...privacy!,
                      anonymous_data_research: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cookies de Análisis</Label>
                  <p className="text-sm text-gray-500">
                    Ayúdanos a mejorar la plataforma con datos de uso
                  </p>
                </div>
                <Switch
                  checked={privacy?.analytics_cookies || false}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy({ ...privacy!, analytics_cookies: checked })
                  }
                />
              </div>

              <Button onClick={savePrivacy} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Privacidad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
