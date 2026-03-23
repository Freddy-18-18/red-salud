"use client";

// Este hook ahora es un wrapper del contexto para mantener compatibilidad
// TODO: Import from @red-salud/core when sidebar-context is properly wired
export type SidebarMode = 'collapsed' | 'expanded' | 'floating';
export function useSidebarState() {
  // Placeholder - consumers should provide actual sidebar context
  return { mode: 'expanded' as SidebarMode, setMode: (_: SidebarMode) => {} };
}
