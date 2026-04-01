"use client";

import { Printer, Download, AlertTriangle, Phone, Heart } from "lucide-react";
import { useRef } from "react";

import {
  type MedicalIdData,
  type QRPreferences,
  generateQRSvg,
} from "@/lib/services/medical-id-service";

interface PrintableCardProps {
  data: MedicalIdData;
  preferences: QRPreferences;
  qrContent: string;
}

export function PrintableCard({
  data,
  preferences,
  qrContent,
}: PrintableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const qrSvg = generateQRSvg(qrContent, 120);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!cardRef.current) return;

    // Use html2canvas approach: render to canvas via SVG foreignObject
    const card = cardRef.current;
    const clone = card.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);

    // Create a simple downloadable image using the card's HTML
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
        <foreignObject width="640" height="400">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px;">
            ${card.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarjeta-medica-${data.full_name.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(clone);
  };

  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div ref={cardRef} className="printable-card">
        {/* Front side */}
        <div className="w-full max-w-md mx-auto bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white shadow-lg print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Info */}
            <div className="flex-1 space-y-3">
              {/* Logo / Brand */}
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-emerald-200" />
                <span className="text-sm font-bold text-emerald-100 tracking-wide">
                  RED SALUD
                </span>
              </div>

              {/* Name */}
              <div>
                <p className="text-lg font-bold leading-tight">
                  {data.full_name}
                </p>
                {data.age != null && (
                  <p className="text-sm text-emerald-200 mt-0.5">
                    {data.age} anos
                  </p>
                )}
              </div>

              {/* Blood type */}
              {preferences.show_blood_type && data.blood_type && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full">
                  <span className="text-xs font-bold">SANGRE</span>
                  <span className="text-sm font-black">{data.blood_type}</span>
                </div>
              )}

              {/* ID label */}
              <p className="text-[10px] text-emerald-300 tracking-widest uppercase">
                Identificacion Medica
              </p>
            </div>

            {/* Right: QR */}
            <div className="flex-shrink-0">
              <div
                className="bg-white rounded-lg p-1.5"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>
          </div>
        </div>

        {/* Back side */}
        <div className="w-full max-w-md mx-auto mt-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-lg print:shadow-none print:mt-0">
          <div className="space-y-3">
            {/* Allergies - always RED for visibility */}
            {preferences.show_allergies && data.allergies.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    ALERGIAS
                  </span>
                </div>
                <p className="text-sm font-semibold text-red-800">
                  {data.allergies.join(", ")}
                </p>
              </div>
            )}

            {/* Medications */}
            {preferences.show_medications && data.medications.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Medicamentos
                </p>
                <p className="text-sm text-gray-800">
                  {data.medications.join(", ")}
                </p>
              </div>
            )}

            {/* Conditions */}
            {preferences.show_conditions && data.conditions.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Condiciones
                </p>
                <p className="text-sm text-gray-800">
                  {data.conditions.join(", ")}
                </p>
              </div>
            )}

            {/* Insurance */}
            {preferences.show_insurance && data.insurance_company && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Seguro
                </p>
                <p className="text-sm text-gray-800">
                  {data.insurance_company}
                  {data.insurance_policy && ` - ${data.insurance_policy}`}
                </p>
              </div>
            )}

            {/* Emergency contact */}
            {preferences.show_emergency_contact &&
              data.emergency_contact_name && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <Phone className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                      Contacto de emergencia
                    </p>
                    <p className="text-sm font-semibold text-amber-900">
                      {data.emergency_contact_name}
                      {data.emergency_contact_relationship &&
                        ` (${data.emergency_contact_relationship})`}
                    </p>
                    {data.emergency_contact_phone && (
                      <p className="text-sm text-amber-800">
                        {data.emergency_contact_phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Organ donor */}
            {preferences.show_organ_donor && data.organ_donor && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Heart className="h-3.5 w-3.5" />
                Donante de organos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center print:hidden">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          <Download className="h-4 w-4" />
          Descargar tarjeta
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
      </div>
    </div>
  );
}
