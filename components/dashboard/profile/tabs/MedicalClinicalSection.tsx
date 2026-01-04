"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { OPCIONES_FUMA, OPCIONES_ALCOHOL, OPCIONES_ACTIVIDAD, OPCIONES_DONANTE } from './medical-form-constants';

interface MedicalClinicalSectionProps {
  localData: Record<string, unknown>;
  formData: Record<string, unknown>;
  isEditing: boolean;
  updateField: (field: string, value: unknown) => void;
}

export function MedicalClinicalSection({
  localData,
  formData,
  isEditing,
  updateField,
}: MedicalClinicalSectionProps) {
  const getStringValue = (val: unknown): string => String(val || '');
  
  return (
    <fieldset className="space-y-5">
      <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-600" />
        Información Clínica Crítica
      </legend>

      {/* Alergias a Medicamentos */}
      <div>
        <Label htmlFor="alergias">Alergias a Medicamentos</Label>
        {isEditing ? (
          <textarea
            id="alergias"
            placeholder="Ej: Penicilina, Ibuprofeno..."
            value={getStringValue(localData.alergias)}
            onChange={(e) => updateField('alergias', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.alergias) || 'Ninguna registrada'}
          </p>
        )}
      </div>

      {/* Alergias Alimentarias */}
      <div>
        <Label htmlFor="alergiasAlimentarias">Alergias Alimentarias</Label>
        {isEditing ? (
          <textarea
            id="alergiasAlimentarias"
            placeholder="Ej: Mariscos, nueces, lactosa..."
            value={getStringValue(localData.alergiasAlimentarias)}
            onChange={(e) => updateField('alergiasAlimentarias', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.alergiasAlimentarias) || 'Ninguna registrada'}
          </p>
        )}
      </div>

      {/* Otras Alergias */}
      <div>
        <Label htmlFor="otrasAlergias">Otras Alergias</Label>
        {isEditing ? (
          <Input
            id="otrasAlergias"
            placeholder="Ej: Polen, látex, polvo..."
            value={getStringValue(localData.otrasAlergias)}
            onChange={(e) => updateField('otrasAlergias', e.target.value)}
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.otrasAlergias) || 'Ninguna registrada'}
          </p>
        )}
      </div>

      {/* Condiciones Crónicas */}
      <div>
        <Label htmlFor="condicionesCronicas">Condiciones Crónicas</Label>
        {isEditing ? (
          <textarea
            id="condicionesCronicas"
            placeholder="Ej: Diabetes tipo 2, hipertensión, asma..."
            value={getStringValue(localData.condicionesCronicas)}
            onChange={(e) => updateField('condicionesCronicas', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.condicionesCronicas) || 'Ninguna registrada'}
          </p>
        )}
      </div>

      {/* Medicamentos Actuales */}
      <div>
        <Label htmlFor="medicamentosActuales">Medicamentos Actuales</Label>
        {isEditing ? (
          <textarea
            id="medicamentosActuales"
            placeholder="Ej: Losartán 50mg (1 vez al día)..."
            value={getStringValue(localData.medicamentosActuales)}
            onChange={(e) => updateField('medicamentosActuales', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.medicamentosActuales) || 'Ninguno registrado'}
          </p>
        )}
      </div>

      {/* Hábitos de Vida */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-orange-900 text-sm">
          Hábitos de Vida
        </h4>

        {/* Fuma */}
        <div>
          <Label htmlFor="fuma">Tabaquismo</Label>
          {isEditing ? (
            <select
              id="fuma"
              title="Seleccionar estado de tabaquismo"
              value={getStringValue(localData.fuma) || 'no'}
              onChange={(e) => updateField('fuma', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_FUMA.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {OPCIONES_FUMA.find((o) => o.value === getStringValue(formData.fuma))
                ?.label || 'No registrado'}
            </p>
          )}
        </div>

        {/* Alcohol */}
        <div>
          <Label htmlFor="consumeAlcohol">Consumo de Alcohol</Label>
          {isEditing ? (
            <select
              id="consumeAlcohol"
              title="Seleccionar consumo de alcohol"
              value={getStringValue(localData.consumeAlcohol) || 'no'}
              onChange={(e) => updateField('consumeAlcohol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ALCOHOL.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {OPCIONES_ALCOHOL.find((o) => o.value === getStringValue(formData.consumeAlcohol))
                ?.label || 'No registrado'}
            </p>
          )}
        </div>

        {/* Actividad Física */}
        <div>
          <Label htmlFor="actividadFisica">Actividad Física</Label>
          {isEditing ? (
            <select
              id="actividadFisica"
              title="Seleccionar nivel de actividad física"
              value={getStringValue(localData.actividadFisica) || 'sedentario'}
              onChange={(e) => updateField('actividadFisica', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ACTIVIDAD.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {OPCIONES_ACTIVIDAD.find(
                (o) => o.value === getStringValue(formData.actividadFisica)
              )?.label || 'No registrado'}
            </p>
          )}
        </div>
      </div>

      {/* Donante de Órganos */}
      <div>
        <Label htmlFor="donanteOrganos">Donante de Órganos</Label>
        {isEditing ? (
          <select
            id="donanteOrganos"
            title="Seleccionar estado de donante de órganos"
            value={getStringValue(localData.donanteOrganos) || 'no_especificado'}
            onChange={(e) => updateField('donanteOrganos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {OPCIONES_DONANTE.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {OPCIONES_DONANTE.find(
              (o) => o.value === getStringValue(formData.donanteOrganos)
            )?.label || 'No especificado'}
          </p>
        )}
      </div>
    </fieldset>
  );
}
