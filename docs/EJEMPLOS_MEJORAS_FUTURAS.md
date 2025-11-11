# 💡 Ejemplos de Código para Mejoras Futuras

## 1. Exportación de Datos a CSV

```typescript
// components/dashboard/medico/export-patients-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportPatientsButtonProps {
  patients: any[];
  filename?: string;
}

export function ExportPatientsButton({ 
  patients, 
  filename = "pacientes" 
}: ExportPatientsButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Cédula",
      "Email",
      "Teléfono",
      "Género",
      "Edad",
      "Tipo Sangre",
      "Total Consultas",
      "Última Consulta"
    ];

    const rows = patients.map(p => [
      p.nombre_completo,
      p.cedula || "N/A",
      p.email || "N/A",
      p.telefono || "N/A",
      p.genero === "M" ? "Masculino" : p.genero === "F" ? "Femenino" : "N/A",
      calculateAge(p.fecha_nacimiento) || "N/A",
      p.tipo_sangre || "N/A",
      p.total_consultations || 0,
      p.last_consultation_date 
        ? new Date(p.last_consultation_date).toLocaleDateString() 
        : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportToCSV}>
      <Download className="h-4 w-4 mr-2" />
      Exportar a CSV
    </Button>
  );
}
```

## 2. Vista de Tarjetas (Grid View)

```typescript
// components/dashboard/medico/patients-grid-view.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Phone, Mail } from "lucide-react";

interface PatientsGridViewProps {
  patients: any[];
  onViewPatient: (id: string) => void;
  onMessagePatient: (id: string) => void;
}

export function PatientsGridView({ 
  patients, 
  onViewPatient, 
  onMessagePatient 
}: PatientsGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => (
        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <Avatar className="h-20 w-20">
                <AvatarImage src={patient.avatar_url} />
                <AvatarFallback className="text-xl">
                  {patient.nombre_completo.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Name and Info */}
              <div className="space-y-2 w-full">
                <h3 className="font-semibold text-lg">{patient.nombre_completo}</h3>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {patient.genero && (
                    <Badge variant="outline">
                      {patient.genero === "M" ? "Masculino" : "Femenino"}
                    </Badge>
                  )}
                  {patient.edad && (
                    <Badge variant="outline">{patient.edad} años</Badge>
                  )}
                  {patient.tipo_sangre && (
                    <Badge variant="secondary">{patient.tipo_sangre}</Badge>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1 text-sm text-gray-600">
                  {patient.telefono && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{patient.telefono}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{patient.total_consultations}</span> consultas
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onViewPatient(patient.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onMessagePatient(patient.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Mensaje
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 3. Gráfico de Consultas por Mes

```typescript
// components/dashboard/medico/consultations-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface ConsultationsChartProps {
  consultations: Array<{ date: string }>;
}

export function ConsultationsChart({ consultations }: ConsultationsChartProps) {
  const monthlyData = useMemo(() => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    
    const counts = new Array(12).fill(0);
    
    consultations.forEach(c => {
      const month = new Date(c.date).getMonth();
      counts[month]++;
    });

    const maxCount = Math.max(...counts, 1);
    
    return months.map((month, index) => ({
      month,
      count: counts[index],
      percentage: (counts[index] / maxCount) * 100
    }));
  }, [consultations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {monthlyData.map((data) => (
            <div key={data.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <span className="text-gray-600">{data.count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 4. Sistema de Etiquetas

```typescript
// components/dashboard/medico/patient-tags.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface PatientTagsProps {
  patientId: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TAG_COLORS = {
  "Seguimiento": "bg-blue-100 text-blue-800",
  "Crónico": "bg-red-100 text-red-800",
  "Prioritario": "bg-amber-100 text-amber-800",
  "Estable": "bg-green-100 text-green-800",
  "Control": "bg-purple-100 text-purple-800",
};

export function PatientTags({ patientId, tags, onTagsChange }: PatientTagsProps) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    const updatedTags = [...tags, newTag.trim()];
    onTagsChange(updatedTags);
    
    // Guardar en la base de datos
    // await supabase.from("patient_tags").insert({ patient_id: patientId, tag: newTag });
    
    setNewTag("");
    setIsAdding(false);
  };

  const removeTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    onTagsChange(updatedTags);
    
    // Eliminar de la base de datos
    // await supabase.from("patient_tags").delete().match({ patient_id: patientId, tag: tagToRemove });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            className={TAG_COLORS[tag as keyof typeof TAG_COLORS] || ""}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {isAdding ? (
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              placeholder="Nueva etiqueta"
              className="h-6 text-xs w-32"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={addTag}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="h-6 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        )}
      </div>
    </div>
  );
}
```

## 5. Notificaciones de Vinculación

```typescript
// lib/supabase/notifications.ts
import { supabase } from "./client";

export async function notifyDoctorOfPatientLink(
  doctorId: string,
  patientName: string,
  patientCedula: string
) {
  // Crear notificación en la base de datos
  await supabase.from("notifications").insert({
    user_id: doctorId,
    type: "patient_linked",
    title: "Paciente Vinculado",
    message: `${patientName} (${patientCedula}) se ha registrado en la plataforma y su historial ha sido vinculado automáticamente.`,
    data: {
      patient_name: patientName,
      patient_cedula: patientCedula,
    },
    read: false,
  });

  // Opcional: Enviar email
  // await sendEmail({
  //   to: doctorEmail,
  //   subject: "Paciente Vinculado - Red Salud",
  //   body: `...`
  // });
}

// Modificar el trigger en la migración para llamar esta función
```

## 6. Filtros Avanzados con Rango de Edad

```typescript
// components/dashboard/medico/advanced-filters.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdvancedFiltersProps {
  filters: {
    ageRange: string;
    bloodType: string;
    lastConsultation: string;
    hasConditions: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      ageRange: "all",
      bloodType: "all",
      lastConsultation: "all",
      hasConditions: false,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros Avanzados</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Age Range */}
        <div className="space-y-2">
          <Label>Rango de Edad</Label>
          <Select
            value={filters.ageRange}
            onValueChange={(value) => onFiltersChange({ ...filters, ageRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las edades</SelectItem>
              <SelectItem value="0-18">0-18 años</SelectItem>
              <SelectItem value="19-40">19-40 años</SelectItem>
              <SelectItem value="41-60">41-60 años</SelectItem>
              <SelectItem value="60+">60+ años</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Blood Type */}
        <div className="space-y-2">
          <Label>Tipo de Sangre</Label>
          <Select
            value={filters.bloodType}
            onValueChange={(value) => onFiltersChange({ ...filters, bloodType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
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

        {/* Last Consultation */}
        <div className="space-y-2">
          <Label>Última Consulta</Label>
          <Select
            value={filters.lastConsultation}
            onValueChange={(value) => onFiltersChange({ ...filters, lastConsultation: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier fecha</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

## 7. Toggle Vista Tabla/Tarjetas

```typescript
// En app/dashboard/medico/pacientes/page.tsx
const [viewMode, setViewMode] = useState<"table" | "grid">("table");

// En el JSX
<div className="flex items-center gap-2">
  <Button
    variant={viewMode === "table" ? "default" : "outline"}
    size="sm"
    onClick={() => setViewMode("table")}
  >
    <List className="h-4 w-4" />
  </Button>
  <Button
    variant={viewMode === "grid" ? "default" : "outline"}
    size="sm"
    onClick={() => setViewMode("grid")}
  >
    <Grid className="h-4 w-4" />
  </Button>
</div>

{viewMode === "table" ? (
  <PatientsTableView patients={filteredPatients} />
) : (
  <PatientsGridView patients={filteredPatients} />
)}
```

---

## 📝 Notas de Implementación

Estos ejemplos son plantillas que puedes adaptar según tus necesidades. Recuerda:

1. **Instalar dependencias necesarias** si usas librerías de gráficos
2. **Crear las tablas en Supabase** para etiquetas y notificaciones
3. **Ajustar los tipos TypeScript** según tu schema
4. **Probar en diferentes dispositivos** para asegurar responsividad
5. **Implementar manejo de errores** adecuado
6. **Agregar loading states** para mejor UX

¡Estas mejoras llevarán tu dashboard al siguiente nivel! 🚀
