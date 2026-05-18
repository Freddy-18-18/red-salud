'use client';

interface Props {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
  submitting?: boolean;
  nextLabel?: string;
}

export function WizardFooter({ onBack, onNext, disabled, submitting, nextLabel }: Props) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Atras
        </button>
      ) : (
        <span />
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={disabled || submitting}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
      >
        {submitting ? 'Guardando...' : nextLabel ?? 'Continuar'}
      </button>
    </div>
  );
}
