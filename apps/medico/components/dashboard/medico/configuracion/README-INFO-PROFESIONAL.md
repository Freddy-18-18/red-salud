# Información Profesional - Arquitectura Modular

## 📁 Estructura de Archivos

```
components/dashboard/medico/configuracion/
├── info-profesional-section-v2.tsx          # 🎯 Componente principal orquestador
├── info-profesional-animations.css          # 🎨 Animaciones y estilos compartidos
│
├── tabs/                                     #  📑 Componentes modulares de cada tab
│   ├── formacion-tab.tsx                     # Formación académica
│   ├── certificaciones-tab.tsx               # Certificaciones con PDF upload y SACS
│   ├── atencion-medica-tab.tsx               # Áreas de atención (ex "Enfermedades")
│   ├── experiencia-tab.tsx                   # Experiencia laboral
│   ├── seguros-tab.tsx                       # Seguros médicos aceptados
│   └── presencia-digital-tab.tsx             # Redes sociales y sitio web
│
├── hooks/                                    # 🎣 Hooks personalizados reutilizables
│   ├── use-professional-data.ts              # CRUD para datos del perfil
│   ├── use-file-upload-storage.ts            # Upload/Delete de archivos a Supabase Storage
│   └── use-sacs-integration.ts               # Integración con verificación SACS
│
├── types/                                    # 📘 Definiciones TypeScript
│   └── professional-types.ts                 # Interfaces compartidas
│
└── searchable-select.tsx                     # Component helper (ya existía)
```

## ✨ Características Principales

### 1. **Arquitectura Modular**
- ✅ Cada tab es un componente independiente (~200-300 líneas)
- ✅ Single Responsibility Principle
- ✅ Fácil mantenimiento y testing
- ✅ Reutilizable y escalable

### 2. **Tabs Organizados**
1. **Formación**: Universidad, matrícula, años de experiencia
2. **Certificaciones**: SACS auto-sync + upload manual de PDFs
3. **Áreas de Atención**: Condiciones tratadas, idiomas, grupos de edad
4. **Experiencia**: Timeline de trabajos anteriores
5. **Seguros**: Seguros médicos aceptados y planes
6. **Presencia Digital**: Redes sociales y sitio web

### 3. **Integración SACS**
- Auto-carga de certificaciones verificadas por SACS
- Badge visual "SACS ✓" en certificaciones oficiales
- Sincronización manual con botón dedicado

### 4. **Upload de Archivos**
- Upload de PDFs para certificados
- Máximo 5MB por archivo
- Almacenamiento en Supabase Storage
- Preview y descarga de documentos

### 5. **Gestión de Estado**
- Hook `useProfessionalData` centraliza toda la lógica
- Estados de carga, error y guardado
- Validación inline
- Feedback visual inmediato

## 🔧 Uso

### Integración en la Página Principal

```tsx
import { InfoProfesionalSectionV2 } from "./info-profesional-section-v2";

// En el switch de tabs:
case "info-profesional":
  return <InfoProfesionalSectionV2 />;
```

### Hook de Datos Profesionales

```tsx
const { data, loading, error, updateData, saveData } = useProfessionalData();

// Actualizar datos localmente
updateData({ universidad: "Nueva Universidad" });

// Guardar en la BD
const result = await saveData(data);
```

### Hook de Upload

```tsx
const { uploadFile, deleteFile, uploading, progress } = useFileUploadStorage({
  folder: "certifications",
  onSuccess: (url, fileName) => console.log("Uploaded:", url),
});

// Subir archivo
const result = await uploadFile(file);

// Eliminar archivo
await deleteFile(fileUrl);
```

### Hook SACS

```tsx
const { fetchSacsCertifications, syncSacsCertifications } = useSacsIntegration();

// Obtener certificaciones de SACS
const result = await fetchSacsCertifications();

// Sincronizar con certificaciones existentes
const merged = await syncSacsCertifications(existingCertifications);
```

## 📝 Tipos TypeScript

### ProfessionalData
Tipo principal que contiene todos los datos del perfil:
- Formación académica
- Certificaciones
- Experiencia
- Seguros
- Redes sociales

### TabComponentProps
Props que recibe cada componente de tab:
```tsx
interface TabComponentProps {
  data: ProfessionalData;
  isEditing: boolean;
  onUpdate: (updates: Partial<ProfessionalData>) => void;
}
```

## 🎨 Diseño Visual

- **Gradientes**: Violet → Purple para elementos principales
- **Animaciones**: Framer Motion para transiciones suaves
- **Cards temáticos**: Cada tab tiene su color característico
- **Responsive**: Grid adaptativo 2-6 columnas según viewport
- **Dark Mode**: Soporte completo

## 🚀 Próximos Pasos

- [ ] Migraciones de BD para nuevos campos (publicaciones, asociaciones)
- [ ] Testing unitario para cada tab
- [ ] E2E tests para flujo completo
- [ ] Configurar bucket de Supabase Storage
- [ ] Implementar políticas RLS para archivos
- [ ] Analytics para tracking de completitud del perfil

## 📚 Documentación Relacionada

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Última actualización**: `$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`
