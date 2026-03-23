/**
 * Check if running inside Tauri desktop app.
 */
export function isRunningInTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
