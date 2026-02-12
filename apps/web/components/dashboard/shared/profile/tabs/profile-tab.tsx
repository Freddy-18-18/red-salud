import { motion } from "framer-motion";
import { Edit2, Save, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { PhoneInput } from "@red-salud/ui";
import { DatePicker } from "@red-salud/ui";
import { CustomSelect } from "@red-salud/ui";
import { EmergencyContactCard } from "../components/emergency-contact-card";
import { ESTADOS_VENEZUELA } from "../constants";
import { CIUDADES_POR_ESTADO } from "@/lib/constants/venezuela-cities";
import type { TabComponentProps } from "../types";
import { useState, useEffect } from "react";

export function ProfileTab({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  // Estado local para edición
  const [localData, setLocalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);

  // Actualizar estado local cuando cambian los datos del servidor
  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const [isValidatingCedula, setIsValidatingCedula] = useState(false);
  const [cedulaValidationStatus, setCedulaValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [cedulaError, setCedulaError] = useState<string>("");
  const [nacionalidadCedula, setNacionalidadCedula] = useState<"V" | "E">("V");
  const [numeroCedula, setNumeroCedula] = useState<string>("");
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);

  // Cédula bloqueada si está verificada O si fue validada exitosamente
  const isCedulaLocked = localData.cedulaVerificada || (cedulaValidationStatus as string) === "success";

  useEffect(() => {
    if (localData.cedula) {
      const match = localData.cedula.match(/^([VE])-?(\d+)$/i);
      if (match && match[1] && match[2]) {
        setNacionalidadCedula(match[1].toUpperCase() as "V" | "E");
        setNumeroCedula(match[2]);
      }
    }
  }, [localData.cedula]);

  useEffect(() => {
    if (localData.estado) {
      setCiudadesDisponibles(CIUDADES_POR_ESTADO[localData.estado] || []);
      if (
        localData.ciudad &&
        !CIUDADES_POR_ESTADO[localData.estado]?.includes(localData.ciudad)
      ) {
        setLocalData(prev => ({ ...prev, ciudad: "" }));
      }
    } else {
      setCiudadesDisponibles([]);
    }
  }, [localData.estado, localData.ciudad]);

  const handleCedulaValidation = async () => {
    if (!numeroCedula) {
      setCedulaValidationStatus("error");
      setCedulaError("Debe ingresar el número de cédula");
      return;
    }

    if (numeroCedula.length < 6) {
      setCedulaValidationStatus("error");
      setCedulaError("El número de cédula debe tener al menos 6 dígitos");
      return;
    }

    const nacionalidad = nacionalidadCedula;
    const cedula = numeroCedula;

    setIsValidatingCedula(true);
    setCedulaValidationStatus("idle");
    setCedulaError("");

    try {
      const response = await fetch("/api/validate-cedula", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nacionalidad, cedula }),
      });

      const result = await response.json();

      if (result.error) {
        setCedulaValidationStatus("error");

        // Mensajes personalizados según el código de error
        if (result.code === "CEDULA_DUPLICADA") {
          setCedulaError("⚠️ Esta cédula ya está registrada en otra cuenta. Contacta a soporte si necesitas ayuda.");
        } else if (result.code === "SIN_DATOS_CNE") {
          setCedulaError("⚠️ Esta cédula no tiene datos del CNE. Contacta a soporte para verificación manual.");
        } else {
          setCedulaError(result.message || "No se pudo validar la cédula");
        }
        return;
      }

      const updatedData = {
        ...localData,
        cedula: `${result.data.nacionalidad}-${result.data.cedula}`,
        nombre: result.data.nombreCompleto,
        cneEstado: result.data.cne?.estado || "",
        cneMunicipio: result.data.cne?.municipio || "",
        cneParroquia: result.data.cne?.parroquia || "",
        cneCentroElectoral: result.data.cne?.centroElectoral || "",
        rif: result.data.rif || "",
        nacionalidad: result.data.nacionalidad || "V",
        primerNombre: result.data.primerNombre || "",
        segundoNombre: result.data.segundoNombre || "",
        primerApellido: result.data.primerApellido || "",
        segundoApellido: result.data.segundoApellido || "",
      };

      setLocalData(updatedData);
      setCedulaValidationStatus("success");
    } catch (error) {
      console.error("Error validating cedula:", error);
      setCedulaValidationStatus("error");
      setCedulaError("Error al conectar con el servicio de validación");
    } finally {
      setIsValidatingCedula(false);
    }
  };

  const handleCedulaBlur = () => {
    if (numeroCedula && isEditing && !isCedulaLocked) {
      handleCedulaValidation();
    }
  };

  const handleLocalSave = async () => {
    // Validar campos requeridos antes de guardar
    const missingFields = [];
    if (!localData.nombre || localData.nombre.trim() === "") missingFields.push("Nombre completo");
    if (!localData.telefono || localData.telefono.trim() === "" || localData.telefono === "+58 ") missingFields.push("Teléfono");
    if (!localData.cedula || localData.cedula.trim() === "") missingFields.push("Cédula");
    if (!localData.fechaNacimiento || localData.fechaNacimiento.trim() === "") missingFields.push("Fecha de nacimiento");
    if (!localData.direccion || localData.direccion.trim() === "") missingFields.push("Dirección");
    if (!localData.estado || localData.estado.trim() === "") missingFields.push("Estado");
    if (!localData.ciudad || localData.ciudad.trim() === "") missingFields.push("Ciudad");

    if (missingFields.length > 0) {
      alert(`Por favor completa los siguientes campos obligatorios:\n\n${missingFields.join("\n")}`);
      return;
    }

    // Validar formato de cédula
    if (!/^[VE]-\d{6,8}$/.test(localData.cedula)) {
      alert("El formato de la cédula es inválido. Debe ser V-12345678 o E-12345678");
      return;
    }

    setIsSaving(true);
    try {
      console.log("📋 [ProfileTab] Datos locales antes de guardar:", localData);

      // Guardar en el servidor PRIMERO con los datos actualizados
      const result = await handleSave(localData);

      if (result.success) {
        // Solo actualizar estado local si el guardado fue exitoso
        setFormData(localData);
        console.log("✅ [ProfileTab] Guardado exitoso");
      } else {
        console.error("❌ [ProfileTab] Error al guardar:", result.error);
        throw new Error(result.error || "Error al guardar");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(formData);
    setIsEditing(false);
    setCedulaValidationStatus("idle");
    setCedulaError("");
  };

  return (
    <motion.article
      key="profile"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Información Personal
          </h2>
          {formData.cedulaVerificada && !isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1">
              <p className="text-xs text-yellow-800">
                Nombre y cédula bloqueados
              </p>
            </div>
          )}
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" aria-hidden="true" />
              Cancelar
            </Button>
            <Button onClick={handleLocalSave} size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </header>

      {formData.cedulaVerificada && !formData.photoVerified && (
        <div className="max-w-md mb-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong>Cédula anclada.</strong> Sube la foto en Documentos (30 días).
            </p>
          </div>
        </div>
      )}

      <form className="grid grid-cols-2 gap-6">
        <fieldset className="space-y-5">
          <legend className="sr-only">Información básica</legend>

          <div>
            <Label htmlFor="nombre">Nombre Completo *</Label>
            {isEditing && !isCedulaLocked && (cedulaValidationStatus as string) !== "success" ? (
              <Input
                id="nombre"
                value={localData.nombre}
                onChange={(e) =>
                  setLocalData({ ...localData, nombre: e.target.value })
                }
                required
                aria-required="true"
                placeholder="Ingresa tu cédula para validar tu nombre"
                disabled
                className="bg-gray-50"
              />
            ) : (
              <div>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {localData.nombre || "No registrado"}
                </p>
                {(isCedulaLocked || (cedulaValidationStatus as string) === "success") && isEditing && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Nombre validado con la cédula
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Modifica tu email en la sección de Seguridad
            </p>
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            {isEditing ? (
              <PhoneInput
                value={localData.telefono}
                onChange={(value) =>
                  setLocalData({ ...localData, telefono: value })
                }
                disabled={false}
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.telefono || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cedula">Cédula de Identidad *</Label>
            {isEditing && !isCedulaLocked ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={nacionalidadCedula}
                    onChange={(e) => {
                      setNacionalidadCedula(e.target.value as "V" | "E");
                      setCedulaValidationStatus("idle");
                      setCedulaError("");
                    }}
                    className="w-16 h-10 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
                    aria-label="Nacionalidad"
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                  <div className="relative flex-1">
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="12345678"
                      value={numeroCedula}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setNumeroCedula(value);
                        setLocalData({
                          ...localData,
                          cedula: value ? `${nacionalidadCedula}-${value}` : ""
                        });
                        setCedulaValidationStatus("idle");
                        setCedulaError("");
                      }}
                      onBlur={handleCedulaBlur}
                      required
                      aria-required="true"
                      maxLength={8}
                      className={
                        cedulaValidationStatus === "error"
                          ? "border-red-500"
                          : cedulaValidationStatus === "success"
                            ? "border-green-500"
                            : ""
                      }
                    />
                    {isValidatingCedula && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {!isValidatingCedula && cedulaValidationStatus === "error" && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {cedulaValidationStatus === "error" && cedulaError && (
                  <p className="text-xs text-red-600">{cedulaError}</p>
                )}
                {cedulaValidationStatus === "idle" && (
                  <p className="text-xs text-gray-500">
                    Ingrese su cédula para validar automáticamente
                  </p>
                )}
                {cedulaValidationStatus === "success" && (
                  <p className="text-xs text-green-600">
                    ✓ Cédula validada correctamente
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {localData.cedula || formData.cedula || "No registrada"}
                </p>
                {formData.cedulaVerificada && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Cédula anclada
                  </p>
                )}
                {!formData.cedulaVerificada && (cedulaValidationStatus as string) === "success" && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Cédula validada
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
            {isEditing && !isCedulaLocked ? (
              <div className="space-y-1">
                <DatePicker
                  value={localData.fechaNacimiento}
                  onChange={(value) =>
                    setLocalData({ ...localData, fechaNacimiento: value })
                  }
                  maxDate={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-gray-500">
                  Escribe la fecha en formato DD/MM/AAAA o haz clic en el calendario
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formData.fechaNacimiento
                    ? new Date(formData.fechaNacimiento + "T00:00:00").toLocaleDateString(
                      "es-VE",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                    : "No registrada"}
                </p>
                {isCedulaLocked && isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    La fecha de nacimiento no se puede modificar
                  </p>
                )}
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="sr-only">Dirección</legend>

          <div>
            <Label htmlFor="direccion">Dirección Completa *</Label>
            {isEditing ? (
              <textarea
                id="direccion"
                placeholder="Av. Principal, Edificio, Piso, Apartamento..."
                value={localData.direccion}
                onChange={(e) =>
                  setLocalData({ ...localData, direccion: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px]"
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.direccion || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="estado">Estado *</Label>
            {isEditing ? (
              <CustomSelect
                value={localData.estado}
                onChange={(value) =>
                  setLocalData({ ...localData, estado: value })
                }
                options={[...ESTADOS_VENEZUELA]}
                placeholder="Seleccionar estado"
                direction="down"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.estado || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ciudad">Ciudad *</Label>
            {isEditing ? (
              <CustomSelect
                value={localData.ciudad}
                onChange={(value) =>
                  setLocalData({ ...localData, ciudad: value })
                }
                options={ciudadesDisponibles}
                placeholder={
                  localData.estado
                    ? "Seleccionar ciudad"
                    : "Primero seleccione un estado"
                }
                disabled={!localData.estado || ciudadesDisponibles.length === 0}
                direction="up"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.ciudad || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="codigoPostal">Código Postal</Label>
            {isEditing ? (
              <Input
                id="codigoPostal"
                placeholder="1010"
                value={localData.codigoPostal}
                onChange={(e) =>
                  setLocalData({ ...localData, codigoPostal: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.codigoPostal || "No registrado"}
              </p>
            )}
          </div>

          {/* Contacto de Emergencia */}
          <div className="col-span-2">
            <EmergencyContactCard
              contactoEmergencia={localData.contactoEmergencia}
              telefonoEmergencia={localData.telefonoEmergencia}
              relacionEmergencia={localData.relacionEmergencia}
              onUpdate={async (data) => {
                console.log("🔄 [EmergencyContact] Iniciando actualización:", data);

                // Crear objeto con todos los datos actualizados
                const updatedData = {
                  ...localData,
                  contactoEmergencia: data.contactoEmergencia,
                  telefonoEmergencia: data.telefonoEmergencia,
                  relacionEmergencia: data.relacionEmergencia,
                };

                console.log("📦 [EmergencyContact] Datos completos a guardar:", {
                  contactoEmergencia: updatedData.contactoEmergencia,
                  telefonoEmergencia: updatedData.telefonoEmergencia,
                  relacionEmergencia: updatedData.relacionEmergencia,
                });

                // Guardar en el servidor PRIMERO con los datos actualizados
                // Esto evita race conditions con Redux
                const result = await handleSave(updatedData);

                if (result.success) {
                  // Solo actualizar estados locales si el guardado fue exitoso
                  setLocalData(updatedData);
                  setFormData(updatedData);
                  console.log("✅ [EmergencyContact] Actualización completada exitosamente");
                } else {
                  console.error("❌ [EmergencyContact] Error en actualización:", result.error);
                  throw new Error(result.error || "Error al guardar");
                }
              }}
            />
          </div>

          {isEditing && (
            <aside className="bg-blue-50 border border-blue-200 rounded-lg p-3 col-span-2">
              <p className="text-xs text-blue-800">
                {isCedulaLocked ? (
                  <>
                    <strong>Nota:</strong> Puedes modificar dirección, ciudad, estado, código postal y teléfono.
                    Nombre, cédula y fecha de nacimiento están bloqueados por seguridad.
                  </>
                ) : (
                  <>
                    <strong>Nota:</strong> Los campos marcados con * son obligatorios.
                  </>
                )}
              </p>
            </aside>
          )}
        </fieldset>
      </form>
    </motion.article>
  );
}
