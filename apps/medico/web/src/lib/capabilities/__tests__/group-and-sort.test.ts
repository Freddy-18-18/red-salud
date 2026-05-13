import { describe, expect, it } from 'vitest';
import { groupAndSort } from '../group-and-sort';
import type { MedicoModule } from '../types';

function mod(
  key: string,
  displayGroup: MedicoModule['displayGroup'],
  displayOrder: number,
): MedicoModule {
  return {
    key,
    label: key,
    icon: 'Puzzle',
    route: `/dashboard/modulos/${key}`,
    displayGroup,
    displayOrder,
    minVerification: 'sacs',
    minPlan: 'starter',
  };
}

describe('groupAndSort (spec R5)', () => {
  it('R5-A: groups modules by displayGroup into 5 hardcoded groups in fixed order', () => {
    const modules = [
      mod('mensajes', 'comunicacion', 10),
      mod('lab-orders', 'analisis', 100),
      mod('inicio', 'clinica', 10),
    ];
    const result = groupAndSort(modules);
    expect(result.map((g) => g.key)).toEqual(['clinica', 'analisis', 'comunicacion']);
  });

  it('R5-B: omits empty groups from the output', () => {
    const modules = [mod('inicio', 'clinica', 10)];
    const result = groupAndSort(modules);
    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe('clinica');
  });

  it('R5-C: uses the canonical group order Clínica → Análisis → Comunicación → Crecimiento → Configuración', () => {
    const modules = [
      mod('configuracion', 'configuracion', 10),
      mod('estadisticas', 'crecimiento', 10),
      mod('mensajes', 'comunicacion', 10),
      mod('lab-orders', 'analisis', 10),
      mod('inicio', 'clinica', 10),
    ];
    const result = groupAndSort(modules);
    expect(result.map((g) => g.key)).toEqual([
      'clinica',
      'analisis',
      'comunicacion',
      'crecimiento',
      'configuracion',
    ]);
  });

  it('R5-D: sorts items within a group by displayOrder ascending', () => {
    const modules = [
      mod('recetas', 'clinica', 50),
      mod('inicio', 'clinica', 10),
      mod('pacientes', 'clinica', 30),
    ];
    const result = groupAndSort(modules);
    const clinicaItems = result.find((g) => g.key === 'clinica')?.items ?? [];
    expect(clinicaItems.map((i) => i.key)).toEqual(['inicio', 'pacientes', 'recetas']);
  });

  it('R5-E: emits Spanish labels for each group', () => {
    const modules = [mod('inicio', 'clinica', 10), mod('lab-orders', 'analisis', 100)];
    const result = groupAndSort(modules);
    expect(result.find((g) => g.key === 'clinica')?.label).toBe('Clínica');
    expect(result.find((g) => g.key === 'analisis')?.label).toBe('Análisis');
  });

  it('R5-F: maps MedicoModule fields to ResolvedNavItem shape (key/label/href/icon)', () => {
    const modules = [
      {
        key: 'chronic-mgmt',
        label: 'Crónicos',
        icon: 'Activity',
        route: '/dashboard/modulos/chronic-mgmt',
        displayGroup: 'clinica' as const,
        displayOrder: 100,
        minVerification: 'sacs' as const,
        minPlan: 'starter' as const,
        badge: 'Próximamente',
      },
    ];
    const result = groupAndSort(modules);
    const item = result[0]?.items[0];
    expect(item).toEqual({
      key: 'chronic-mgmt',
      label: 'Crónicos',
      href: '/dashboard/modulos/chronic-mgmt',
      icon: 'Activity',
      badge: 'Próximamente',
    });
  });

  it('R5-G: empty input returns empty array', () => {
    expect(groupAndSort([])).toEqual([]);
  });
});
