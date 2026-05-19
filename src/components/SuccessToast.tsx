interface SuccessToastProps {
  title: string;
  durationMs: number;
}

function SuccessToast({ title, durationMs }: SuccessToastProps) {
  return (
    <div className="min-w-[320px] max-w-md rounded-2xl border border-emerald-200 bg-white p-4 shadow-panel">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{
            animation: `toast-progress ${durationMs}ms linear forwards`,
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
}

export default SuccessToast;
