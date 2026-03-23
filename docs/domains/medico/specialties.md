# Specialty Experience System

The application has a specialty-aware dashboard system that adapts the UI and available modules based on the doctor's specialty.

## How It Works

Located in `lib/specialty-experience/`:

1. **Detection Layer**: Reads the doctor's `specialty_name` from `doctor_profiles`
2. **Experience Config Layer**: Determines which layout, modules, widgets, and KPIs to show
3. **Execution Layer**: Dynamically renders menu, dashboard home, and quick access items

### Odontology Detection

```typescript
function isOdontologySpecialty(specialtyName: string): boolean {
  return specialtyName?.toLowerCase().includes("odontolog");
}
```

Valid specialties: "Odontologia General", "Odontologia Pediatrica", "Odontologo", "Cirujano Odontologico", etc.

### Configuration

```typescript
function getSpecialtyExperienceConfig(specialty: string): SpecialtyConfig {
  // Returns dashboard variant and enabled modules
}
```

## Module Groups

### For Odontology

| Group | Modules |
|-------|---------|
| Clinical | Periodontograma, Dental Imaging, 3D Models, Formularios |
| Financial | Presupuestos, RCM Dental, Membresias |
| Lab | Laboratorio, Inventario |
| Technology | Imagenes IA, Teledentologia |
| Communication | Llamadas |
| Growth | Practice Growth, Morning Huddle |

### Odontology Menu Routes

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Clinica Dental | /dashboard/medico/odontologia |
| Gum | Periodontograma | /dashboard/medico/odontologia/periodontograma |
| Sunrise | Morning Huddle | /dashboard/medico/odontologia/morning-huddle |
| UserPlus | Lista de Espera | /dashboard/medico/odontologia/lista-espera |
| FileText | Presupuestos | /dashboard/medico/odontologia/presupuestos |
| Clipboard | Formularios | /dashboard/medico/odontologia/formularios |
| Shield | Seguros | /dashboard/medico/odontologia/seguros |
| Flask | Laboratorio | /dashboard/medico/odontologia/laboratorio |
| Package | Inventario | /dashboard/medico/odontologia/inventario |
| Scan | Imagenes IA | /dashboard/medico/odontologia/imaging |
| Box | Modelos 3D | /dashboard/medico/odontologia/modelos-3d |
| Video | Teledentologia | /dashboard/medico/odontologia/teledentologia |
| Phone | Llamadas | /dashboard/medico/odontologia/llamadas |
| CreditCard | Membresias | /dashboard/medico/odontologia/membresias |
| TrendingUp | Practice Growth | /dashboard/medico/odontologia/growth |
| DollarSign | RCM Dental | /dashboard/medico/odontologia/rcm |

## Future Subspecialties (v2)

- **Ortodoncia**: Case progress tracking, plan adherence, missed appointments, orthodontic emergencies
- **Periodoncia**: Periodontal status by quadrant, critical pockets, maintenance plans
- **Implantologia**: Pipeline by phases (diagnosis-surgery-prosthesis), success/complications
- **Endodoncia**: Acute pain/urgency, retreatments, resolution times

## Key Files

- Engine: `apps/web/lib/specialty-experience/engine.ts`
- Dashboard: `apps/web/app/dashboard/medico/odontologia/`
