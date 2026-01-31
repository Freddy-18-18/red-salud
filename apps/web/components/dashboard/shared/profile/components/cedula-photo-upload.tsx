"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Label } from "@red-salud/ui";

interface CedulaPhotoUploadProps {
  expectedCedula?: string;
  expectedNombre?: string;
  onVerificationComplete: (data: any) => void;
}

export function CedulaPhotoUpload({
  expectedCedula,
  expectedNombre,
  onVerificationComplete,
}: CedulaPhotoUploadProps) {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setVerificationStatus("idle");
    }
  };

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!frontImage) {
      setVerificationStatus("error");
      setVerificationMessage("Por favor sube la imagen frontal de tu cédula");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("idle");
    setVerificationMessage("");

    try {
      const formData = new FormData();
      formData.append("front_image", frontImage);
      if (backImage) {
        formData.append("back_image", backImage);
      }
      if (expectedCedula) {
        formData.append("expected_cedula", expectedCedula);
      }
      if (expectedNombre) {
        formData.append("expected_nombre", expectedNombre);
      }

      const response = await fetch("/api/verify-cedula-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setVerificationStatus("error");
        setVerificationMessage(result.message || "Error al verificar la cédula");
        return;
      }

      if (result.verified) {
        setVerificationStatus("success");
        setVerificationMessage(result.message);
        setVerificationData(result);
        onVerificationComplete(result);
      } else {
        setVerificationStatus("error");
        setVerificationMessage(
          result.validations?.warnings?.join(". ") || result.message
        );
        setVerificationData(result);
      }
    } catch (error) {
      console.error("Error verifying cedula:", error);
      setVerificationStatus("error");
      setVerificationMessage("Error al conectar con el servicio de verificación");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          📸 Verificación de Cédula con Foto
        </h3>
        <p className="text-sm text-blue-800">
          Sube una foto clara de tu cédula para verificar tu identidad. Los datos
          de la foto deben coincidir con la cédula que ingresaste.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen Frontal */}
        <div>
          <Label htmlFor="front-image" className="mb-2 block">
            Foto Frontal de la Cédula *
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            {frontPreview ? (
              <div className="space-y-4">
                <img
                  src={frontPreview}
                  alt="Vista previa frontal"
                  className="max-h-48 mx-auto rounded"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFrontImage(null);
                    setFrontPreview("");
                  }}
                >
                  Cambiar imagen
                </Button>
              </div>
            ) : (
              <label
                htmlFor="front-image"
                className="cursor-pointer flex flex-col items-center"
              >
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Haz clic para subir la foto frontal
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG hasta 10MB
                </span>
              </label>
            )}
            <input
              id="front-image"
              type="file"
              accept="image/*"
              onChange={handleFrontImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Imagen Trasera (Opcional) */}
        <div>
          <Label htmlFor="back-image" className="mb-2 block">
            Foto Trasera de la Cédula (Opcional)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            {backPreview ? (
              <div className="space-y-4">
                <img
                  src={backPreview}
                  alt="Vista previa trasera"
                  className="max-h-48 mx-auto rounded"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBackImage(null);
                    setBackPreview("");
                  }}
                >
                  Cambiar imagen
                </Button>
              </div>
            ) : (
              <label
                htmlFor="back-image"
                className="cursor-pointer flex flex-col items-center"
              >
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Haz clic para subir la foto trasera
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG hasta 10MB
                </span>
              </label>
            )}
            <input
              id="back-image"
              type="file"
              accept="image/*"
              onChange={handleBackImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Botón de Verificación */}
      <div className="flex justify-center">
        <Button
          onClick={handleVerify}
          disabled={!frontImage || isVerifying}
          className="min-w-[200px]"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Verificar Cédula
            </>
          )}
        </Button>
      </div>

      {/* Resultado de la Verificación */}
      {verificationStatus !== "idle" && (
        <div
          className={`rounded-lg p-4 ${
            verificationStatus === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {verificationStatus === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  verificationStatus === "success"
                    ? "text-green-900"
                    : "text-red-900"
                }`}
              >
                {verificationStatus === "success"
                  ? "✅ Verificación Exitosa"
                  : "❌ Verificación Fallida"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  verificationStatus === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {verificationMessage}
              </p>
              {verificationData && verificationData.extractedData && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold mb-1">Datos extraídos:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>
                      <strong>Cédula:</strong>{" "}
                      {verificationData.extractedData.documentNumber}
                    </li>
                    <li>
                      <strong>Nombre:</strong>{" "}
                      {verificationData.extractedData.fullName}
                    </li>
                    {verificationData.extractedData.dateOfBirth && (
                      <li>
                        <strong>Fecha de Nacimiento:</strong>{" "}
                        {verificationData.extractedData.dateOfBirth}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
