import { Loader2 } from 'lucide-react';

interface Props {
  message: string;
}

export function LoadingState({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-card">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      <p className="mt-5 text-lg font-semibold text-slate-900">{message}</p>
      <p className="mt-1.5 text-sm text-slate-500">This usually takes a few seconds.</p>
    </div>
  );
}
