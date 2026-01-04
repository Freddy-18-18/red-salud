"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, CheckCircle, Loader2, Search, ArrowLeft } from "lucide-react";

interface Props {
  verificationData?: {
    nombre_completo?: string;
    matricula_principal?: string;
  };
  specialties: any[];
  filteredSpecialties: any[];
  specialtyId: string;
  specialtySearch: string;
  recommendedSpecialty: any;
  yearsExperience: string;
  loading: boolean;
  onBack: () => void;
  onComplete: () => void;
  onSelectSpecialtyId: (id: string) => void;
  onSetSpecialtySearch: (v: string) => void;
  onSetYearsExperience: (v: string) => void;
}

export function ProfileForm({
  verificationData,
  specialties,
  filteredSpecialties,
  specialtyId,
  specialtySearch,
  recommendedSpecialty,
  yearsExperience,
  loading,
  onBack,
  onComplete,
  onSelectSpecialtyId,
  onSetSpecialtySearch,
  onSetYearsExperience,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>Información Profesional</CardTitle>
            <CardDescription>Completa tu perfil médico para comenzar a usar Red-Salud</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-blue-900 text-sm">Datos Verificados del SACS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Nombre Completo:</span>
              <p className="font-medium text-gray-900">{verificationData?.nombre_completo}</p>
            </div>
            <div>
              <span className="text-gray-600">Matrícula:</span>
              <p className="font-medium text-gray-900">{verificationData?.matricula_principal}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {recommendedSpecialty && !specialtySearch && (
            <div>
              <Label>Especialidad Recomendada (según SACS)</Label>
              <Card className="mt-2 cursor-pointer hover:shadow-md transition-shadow border-2 border-green-500 bg-green-50" onClick={() => {
                onSelectSpecialtyId(recommendedSpecialty.id);
                onSetSpecialtySearch(recommendedSpecialty.name);
              }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">{recommendedSpecialty.name}</h3>
                      <p className="text-sm text-green-700 mt-1">{recommendedSpecialty.description}</p>
                      <Badge className="mt-2 bg-green-600">Recomendada según tu registro SACS</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <Label htmlFor="specialty-search">{recommendedSpecialty && !specialtySearch ? "O busca otra especialidad" : "Especialidad *"}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="specialty-search" placeholder="Buscar especialidad..." value={specialtySearch} onChange={(e) => onSetSpecialtySearch(e.target.value)} className="pl-10" />
            </div>
            {specialtySearch && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredSpecialties.slice(0, 8).map((specialty: any) => (
                    <Card key={specialty.id} className={`cursor-pointer hover:shadow-md transition-all ${specialtyId === specialty.id ? "border-2 border-blue-500 bg-blue-50" : "hover:border-blue-300"}`} onClick={() => {
                      onSelectSpecialtyId(specialty.id);
                      onSetSpecialtySearch(specialty.name);
                    }}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1">{specialty.name}</h3>
                        {specialty.description && (<p className="text-xs text-gray-600 line-clamp-2">{specialty.description}</p>)}
                        {specialtyId === specialty.id && (<Badge className="mt-2 bg-blue-600">Seleccionada</Badge>)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="experience">Años de Experiencia *</Label>
            <Input id="experience" type="number" min="0" max="60" value={yearsExperience} onChange={(e) => onSetYearsExperience(e.target.value)} placeholder="5" />
            <p className="text-xs text-gray-500 mt-1">Años de experiencia profesional en el área de la salud</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600"><strong>Nota:</strong> Podrás agregar más información como ubicación, horarios, tarifas y biografía desde tu perfil después de completar el registro.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />Atrás
          </Button>
          <Button onClick={onComplete} disabled={loading} className="flex-1" size="lg">
            {loading ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Guardando...</>) : (<><CheckCircle className="h-5 w-5 mr-2" />Completar Registro</>)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

