'use client';

import { type ReactNode } from 'react';
import {
  Loader2,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { DynamicIcon } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ModuleAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost';
}

interface ModuleWrapperProps {
  moduleKey: string;
  title: string;
  icon: string;
  description?: string;
  specialtyContext?: string;
  children: ReactNode;
  actions?: ModuleAction[];
  isEmpty?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  themeColor?: string;
  className?: string;
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ModuleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-5 w-48 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function ModuleEmptyState({
  message,
  themeColor,
}: {
  message: string;
  themeColor: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox
        className="h-12 w-12 mb-3"
        style={{ color: `${themeColor}40` }}
      />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ModuleWrapper({
  moduleKey,
  title,
  icon,
  description,
  children,
  actions,
  isEmpty = false,
  emptyMessage = 'Sin datos disponibles',
  isLoading = false,
  themeColor = '#3B82F6',
  className,
}: ModuleWrapperProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        className,
      )}
      data-module={moduleKey}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <DynamicIcon
              name={icon}
              className="h-4 w-4"
              style={{ color: themeColor }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-700 truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-400 truncate">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                    action.variant === 'ghost'
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      : action.variant === 'outline'
                        ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'text-white',
                  )}
                  style={
                    !action.variant || action.variant === 'default'
                      ? { backgroundColor: themeColor }
                      : undefined
                  }
                >
                  {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="p-5">
        {isLoading ? (
          <ModuleSkeleton />
        ) : isEmpty ? (
          <ModuleEmptyState message={emptyMessage} themeColor={themeColor} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export type { ModuleWrapperProps, ModuleAction };
