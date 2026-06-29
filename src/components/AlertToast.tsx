interface AlertToastProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

function AlertToast({ title, onClose, showCloseButton = true }: AlertToastProps) {
  const [alertTitle, ...alertDetails] = title.split('\n');
  const detailText = alertDetails.join('\n').trim();

  return (
    <div className="flex min-w-[320px] max-w-md items-start gap-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-panel">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-bold text-slate-900">{alertTitle}</p>
        {detailText ? <p className="whitespace-pre-line text-sm font-medium text-slate-700">{detailText}</p> : null}
      </div>
      {showCloseButton && onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          OK
        </button>
      ) : null}
    </div>
  );
}

export default AlertToast;
