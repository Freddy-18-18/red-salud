/**
 * @file certificaciones-tab.tsx
 * @description Tab de certificaciones con upload de PDFs e integración SACS
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Trash2,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Input, Label } from "@red-salud/design-system";
import { FileUpload } from "@red-salud/design-system";
import { useSacsIntegration } from "../hooks/use-sacs-integration";
import { useFileUploadStorage } from "../hooks/use-file-upload-storage";
import type { TabComponentProps, Certification } from "../types/professional-types";

export function CertificacionesTab({
  data,
  isEditing,
  onUpdate,
}: TabComponentProps) {
  const { syncSacsCertifications, loading: sacsLoading } = useSacsIntegration();
  const { uploadFile, deleteFile, uploading } = useFileUploadStorage({
    folder: "certifications",
  });

  const [newCert, setNewCert] = useState<Partial<Certification>>({
    name: "",
    institution: "",
    year: new Date().getFullYear(),
  });
  const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);

  /**
   * Sincroniza certificaciones desde SACS
   */
  const handleSyncSacs = async () => {
    const updated = await syncSacsCertifications(data.certificaciones);
    onUpdate({ certificaciones: updated });
  };

  /**
   * Agrega una nueva certificación
   */
  const handleAddCertification = () => {
    if (!newCert.name || !newCert.institution || !newCert.year) return;

    const certification: Certification = {
      id: `cert-${Date.now()}`,
      name: newCert.name,
      institution: newCert.institution,
      year: newCert.year,
      verified_by_sacs: false,
      created_at: new Date().toISOString(),
    };

    onUpdate({
      certificaciones: [...data.certificaciones, certification],
    });

    setNewCert({
      name: "",
      institution: "",
      year: new Date().getFullYear(),
    });
  };

  /**
   * Elimina una certificación
   */
  const handleDeleteCertification = async (id: string) => {
    const cert = data.certificaciones.find((c) => c.id === id);

    // Eliminar archivo si existe
    if (cert?.file_url) {
      await deleteFile(cert.file_url);
    }

    onUpdate({
      certificaciones: data.certificaciones.filter((c) => c.id !== id),
    });
  };

  /**
   * Maneja la subida de archivo para una certificación
   */
  const handleFileUpload = async (file: File, certId: string) => {
    setUploadingCertId(certId);

    const result = await uploadFile(file);

    if (result) {
      const updatedCerts = data.certificaciones.map((cert) =>
        cert.id === certId
          ? { ...cert, file_url: result.url, file_name: result.fileName }
          : cert
      );
      onUpdate({ certificaciones: updatedCerts });
    }

    setUploadingCertId(null);
  };

  /**
   * Elimina archivo de una certificación
   */
  const handleRemoveFile = async (certId: string) => {
    const cert = data.certificaciones.find((c) => c.id === certId);
    if (!cert?.file_url) return;

    await deleteFile(cert.file_url);

    const updatedCerts = data.certificaciones.map((c) =>
      c.id === certId ? { ...c, file_url: undefined, file_name: undefined } : c
    );
    onUpdate({ certificaciones: updatedCerts });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header con sincronización SACS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Certificaciones y Logros
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.certificaciones.length} certificación(es) registrada(s)
            </p>
          </div>
        </div>

        {isEditing && (
          <Button
            onClick={handleSyncSacs}
            disabled={sacsLoading}
            variant="outline"
            className="gap-2"
          >
            {sacsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Sincronizar SACS
          </Button>
        )}
      </div>

      {/* Lista de certificaciones */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.certificaciones.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {/* Badge de verificación SACS */}
              {cert.verified_by_sacs && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    SACS
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {cert.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {cert.institution}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {cert.year}
                  </p>

                  {/* Archivo adjunto */}
                  {cert.file_url && (
                    <div className="mt-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <a
                        href={cert.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline"
                      >
                        {cert.file_name || "Descargar documento"}
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Upload de archivo */}
                  {isEditing && !cert.verified_by_sacs && !cert.file_url && (
                    <div className="mt-3">
                      <FileUpload
                        accept=".pdf"
                        maxSizeMB={5}
                        onUpload={(file) => handleFileUpload(file, cert.id)}
                        label="Subir certificado (PDF)"
                        description="Máximo 5MB"
                      />
                    </div>
                  )}

                  {uploadingCertId === cert.id && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo archivo...
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                {isEditing && !cert.verified_by_sacs && (
                  <div className="flex gap-2">
                    {cert.file_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFile(cert.id)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCertification(cert.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {data.certificaciones.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay certificaciones registradas</p>
            <p className="text-xs mt-1">
              {isEditing
                ? "Agrega una nueva certificación o sincroniza con SACS"
                : ""}
            </p>
          </div>
        )}
      </div>

      {/* Formulario para agregar certificación */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Plus className="h-5 w-5" />
            <h4 className="font-semibold">Agregar Nueva Certificación</h4>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="new-cert-name">Nombre</Label>
              <Input
                id="new-cert-name"
                value={newCert.name || ""}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                placeholder="Ej: Especialista en Cardiología"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-cert-institution">Institución</Label>
              <Input
                id="new-cert-institution"
                value={newCert.institution || ""}
                onChange={(e) =>
                  setNewCert({ ...newCert, institution: e.target.value })
                }
                placeholder="Ej: Hospital Universitario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-cert-year">Año</Label>
              <Input
                id="new-cert-year"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={newCert.year || ""}
                onChange={(e) =>
                  setNewCert({ ...newCert, year: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <Button
            onClick={handleAddCertification}
            disabled={!newCert.name || !newCert.institution}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Certificación
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
