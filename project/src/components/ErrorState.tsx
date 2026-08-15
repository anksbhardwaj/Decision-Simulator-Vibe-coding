import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

interface Props {
  message?: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ErrorState({ message, onRetry, onBack }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white p-12 text-center shadow-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="mt-5 text-lg font-semibold text-slate-900">
        {message ?? "We couldn't analyze your decision right now."}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Your information is saved. You can try again or go back.
      </p>
      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
