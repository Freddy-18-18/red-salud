'use client';

import { Suspense } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { getModuleComponent, type ModuleComponentProps } from './module-registry';

// ============================================================================
// TYPES
// ============================================================================

interface ModuleRendererProps {
  moduleKey: string;
  config?: Record<string, unknown>;
  doctorId: string;
  patientId?: string;
  specialtySlug: string;
  themeColor?: string;
}

// ============================================================================
// ERROR BOUNDARY (lightweight — class component)
// ============================================================================

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  moduleKey: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ModuleRenderer] Error in module "${this.props.moduleKey}":`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">
            Error al cargar el módulo
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {this.state.error?.message ?? 'Error desconocido'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// FALLBACK COMPONENTS
// ============================================================================

function ModuleLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
    </div>
  );
}

function ModuleNotFound({ moduleKey }: { moduleKey: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-sm text-gray-500">Módulo no disponible</p>
      <p className="text-xs text-gray-400 mt-1">
        &quot;{moduleKey}&quot; no está registrado
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ModuleRenderer({
  moduleKey,
  config,
  doctorId,
  patientId,
  specialtySlug,
  themeColor = '#3B82F6',
}: ModuleRendererProps) {
  const ModuleComponent = getModuleComponent(moduleKey);

  if (!ModuleComponent) {
    return <ModuleNotFound moduleKey={moduleKey} />;
  }

  const moduleProps: ModuleComponentProps = {
    doctorId,
    patientId,
    specialtySlug,
    config,
    themeColor,
  };

  return (
    <ModuleErrorBoundary moduleKey={moduleKey}>
      <Suspense fallback={<ModuleLoadingFallback />}>
        <ModuleComponent {...moduleProps} />
      </Suspense>
    </ModuleErrorBoundary>
  );
}

export type { ModuleRendererProps };
