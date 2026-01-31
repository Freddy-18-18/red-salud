"use client";

import { motion } from "framer-motion";
import { FileText, Upload, Download, CheckCircle, Clock } from "lucide-react";
import { Button } from "@red-salud/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "rejected";
  uploadDate: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Título Universitario",
    type: "titulo",
    status: "verified",
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Certificado MPPS",
    type: "mpps",
    status: "verified",
    uploadDate: "2024-01-15",
  },
  {
    id: "3",
    name: "Cédula de Identidad",
    type: "cedula",
    status: "verified",
    uploadDate: "2024-01-15",
  },
];

export function DocumentsTabDoctor() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Documentos Profesionales
        </h2>
        <p className="text-sm text-gray-600">
          Gestiona tus documentos de verificación profesional
        </p>
      </header>

      <div className="space-y-4">
        {mockDocuments.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {doc.status === "verified" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Verificado</span>
                    </>
                  )}
                  {doc.status === "pending" && (
                    <>
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600">
                        En revisión
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500">
                    • Subido el {new Date(doc.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Documentos Requeridos
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Título universitario de medicina</li>
          <li>• Certificado de registro MPPS vigente</li>
          <li>• Cédula de identidad</li>
          <li>• Certificados de especialización (si aplica)</li>
        </ul>
      </div>
    </motion.article>
  );
}
