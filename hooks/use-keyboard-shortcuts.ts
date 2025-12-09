import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
      const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Atajos predefinidos para el calendario
export const CALENDAR_SHORTCUTS = {
  NEW_APPOINTMENT: { key: 'n', description: 'Nueva cita' },
  TODAY: { key: 't', description: 'Ir a hoy' },
  NEXT_WEEK: { key: 'ArrowRight', description: 'Semana siguiente' },
  PREV_WEEK: { key: 'ArrowLeft', description: 'Semana anterior' },
  DAY_VIEW: { key: 'd', description: 'Vista día' },
  WEEK_VIEW: { key: 'w', description: 'Vista semana' },
  MONTH_VIEW: { key: 'm', description: 'Vista mes' },
  LIST_VIEW: { key: 'l', description: 'Vista lista' },
  SEARCH: { key: 'f', ctrl: true, description: 'Buscar' },
  REFRESH: { key: 'r', ctrl: true, description: 'Actualizar' },
  HELP: { key: '?', shift: true, description: 'Mostrar ayuda' },
};
