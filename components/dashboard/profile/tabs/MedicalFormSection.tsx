"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from 'lucide-react';
import { TIPOS_SANGRE } from '../constants';
import { useIMCCalculation } from '@/hooks/useIMCCalculation';

interface MedicalFormSectionProps {
  localData: Record<string, unknown>;
  formData: Record<string, unknown>;
  isEditing: boolean;
  updateField: (field: string, value: unknown) => void;
}

export function MedicalFormSection({
  localData,
  formData,
  isEditing,
  updateField,
}: MedicalFormSectionProps) {
  const { imc, categoria: imcCategoria } = useIMCCalculation(
    localData.peso as string | number | undefined,
    localData.altura as string | number | undefined
  );
  const esMujer = localData.sexoBiologico === 'femenino';
  const getStringValue = (val: unknown): string => String(val || '');

  return (
    <fieldset className="space-y-5">
      <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        Datos Vitales y Físicos
      </legend>

      {/* Sexo Biológico */}
      <div>
        <Label htmlFor="sexoBiologico">Sexo Biológico *</Label>
        {isEditing ? (
          <select
            id="sexoBiologico"
            title="Seleccionar sexo biológico"
            value={getStringValue(localData.sexoBiologico)}
            onChange={(e) => updateField('sexoBiologico', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {localData.sexoBiologico
              ? String(localData.sexoBiologico).charAt(0).toUpperCase() +
                String(localData.sexoBiologico).slice(1)
              : 'No registrado'}
          </p>
        )}
      </div>

      {/* Tipo de Sangre */}
      <div>
        <Label htmlFor="tipoSangre">Tipo de Sangre *</Label>
        {isEditing ? (
          <select
            id="tipoSangre"
            title="Seleccionar tipo de sangre"
            value={getStringValue(localData.tipoSangre)}
            onChange={(e) => updateField('tipoSangre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar tipo</option>
            {TIPOS_SANGRE.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.tipoSangre) || 'No registrado'}
          </p>
        )}
      </div>

      {/* Peso y Altura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="peso">Peso (kg) *</Label>
          {isEditing ? (
            <Input
              id="peso"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={getStringValue(localData.peso)}
              onChange={(e) => updateField('peso', e.target.value)}
              required
            />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {getStringValue(formData.peso) ? `${formData.peso} kg` : 'No registrado'}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="altura">Altura (cm) *</Label>
          {isEditing ? (
            <Input
              id="altura"
              type="number"
              placeholder="170"
              value={getStringValue(localData.altura)}
              onChange={(e) => updateField('altura', e.target.value)}
              required
            />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {getStringValue(formData.altura) ? `${formData.altura} cm` : 'No registrado'}
            </p>
          )}
        </div>
      </div>

      {/* IMC Calculado */}
      {imc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">
                Índice de Masa Corporal (IMC)
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {imc.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  imcCategoria === 'Normal'
                    ? 'bg-green-100 text-green-800'
                    : imcCategoria === 'Bajo peso'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {imcCategoria}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Perímetro de Cintura */}
      <div>
        <Label htmlFor="perimetroCintura">Perímetro de Cintura (cm)</Label>
        {isEditing ? (
          <Input
            id="perimetroCintura"
            type="number"
            placeholder="85"
            value={getStringValue(localData.perimetroCintura)}
            onChange={(e) => updateField('perimetroCintura', e.target.value)}
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.perimetroCintura)
              ? `${formData.perimetroCintura} cm`
              : 'No registrado'}
          </p>
        )}
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            Importante para evaluar riesgo cardiovascular
          </p>
        )}
      </div>

      {/* Presión Arterial */}
      <div>
        <Label>Presión Arterial Habitual (mmHg)</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            {isEditing ? (
              <Input
                type="number"
                placeholder="120"
                value={getStringValue(localData.presionSistolica)}
                onChange={(e) => updateField('presionSistolica', e.target.value)}
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {getStringValue(formData.presionSistolica) || '--'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Sistólica (máx)</p>
          </div>
          <div>
            {isEditing ? (
              <Input
                type="number"
                placeholder="80"
                value={getStringValue(localData.presionDiastolica)}
                onChange={(e) => updateField('presionDiastolica', e.target.value)}
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {getStringValue(formData.presionDiastolica) || '--'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Diastólica (mín)</p>
          </div>
        </div>
      </div>

      {/* Frecuencia Cardíaca */}
      <div>
        <Label htmlFor="frecuenciaCardiaca">
          Frecuencia Cardíaca en Reposo (lpm)
        </Label>
        {isEditing ? (
          <Input
            id="frecuenciaCardiaca"
            type="number"
            placeholder="70"
            value={getStringValue(localData.frecuenciaCardiaca)}
            onChange={(e) => updateField('frecuenciaCardiaca', e.target.value)}
          />
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {getStringValue(formData.frecuenciaCardiaca)
              ? `${formData.frecuenciaCardiaca} lpm`
              : 'No registrado'}
          </p>
        )}
      </div>

      {/* Campos específicos para mujeres */}
      {esMujer && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-pink-900 text-sm">
            Información Específica
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="embarazada">¿Embarazada?</Label>
              {isEditing ? (
                <select
                  id="embarazada"
                  title="Seleccionar estado de embarazo"
                  value={localData.embarazada ? 'si' : 'no'}
                  onChange={(e) =>
                    updateField('embarazada', e.target.value === 'si')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formData.embarazada ? 'Sí' : 'No'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lactancia">¿Lactancia?</Label>
              {isEditing ? (
                <select
                  id="lactancia"
                  title="Seleccionar estado de lactancia"
                  value={localData.lactancia ? 'si' : 'no'}
                  onChange={(e) =>
                    updateField('lactancia', e.target.value === 'si')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formData.lactancia ? 'Sí' : 'No'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
