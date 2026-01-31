"use client";

import { useState, useEffect } from "react";
import { Keyboard, RotateCcw } from "lucide-react";
import { Button } from "@red-salud/ui";
import { getStoredShortcuts, saveShortcut, DEFAULT_SHORTCUTS } from "@red-salud/core/hooks";

export function ShortcutsSection() {
    // Generic type for shortcuts config
    type ShortcutConfig = { description: string; key: string };
    type ShortcutMap = Record<string, ShortcutConfig>;

    const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS as ShortcutMap);
    const [editing, setEditing] = useState<string | null>(null);

    useEffect(() => {
        // Move to next tick to avoid synchronous set-state-in-effect warning
        setTimeout(() => {
            setShortcuts(getStoredShortcuts());
        }, 0);
    }, []);

    const handleKeyRecord = (action: string) => {
        setEditing(action);
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: string) => {
        e.preventDefault();
        if (e.key === 'Escape') {
            setEditing(null);
            return;
        }

        // Guardar solo teclas simples por ahora para evitar conflictos complejos
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        saveShortcut(action, e.key);
        setShortcuts(getStoredShortcuts());
        setEditing(null);
    };

    const handleReset = () => {
        localStorage.removeItem('red-salud-shortcuts');
        setShortcuts(DEFAULT_SHORTCUTS);
        window.dispatchEvent(new Event('shortcuts-updated'));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Atajos de Teclado</h2>
                    <p className="text-sm text-gray-500">Personaliza las teclas rápidas para agilizar tu flujo de trabajo.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(shortcuts).map(([action, config]) => (
                    <div
                        key={action}
                        className={`p-4 rounded-lg border transition-all ${editing === action ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" : "bg-white hover:border-blue-300"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-700">{config.description}</span>
                            <Keyboard className="h-4 w-4 text-gray-400" />
                        </div>

                        <div className="mt-2">
                            {editing === action ? (
                                <input
                                    autoFocus
                                    readOnly
                                    value="Presiona una tecla..."
                                    onKeyDown={(e) => handleKeyDown(e, action)}
                                    onBlur={() => setEditing(null)}
                                    className="w-full text-center text-sm font-bold text-blue-600 bg-white border rounded py-1 px-2 focus:outline-none"
                                />
                            ) : (
                                <button
                                    onClick={() => handleKeyRecord(action)}
                                    className="w-full text-left"
                                >
                                    <kbd className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 rounded shadow-sm">
                                        {config.key.toUpperCase()}
                                    </kbd>
                                    <span className="text-xs text-gray-400 ml-2">Click para editar</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
