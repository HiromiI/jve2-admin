import type { PropsWithChildren } from 'react';

interface ModalProps {
  title: string;
  panelClassName?: string;
}

function Modal({ title, panelClassName, children }: PropsWithChildren<ModalProps>) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-8">
      <div className="flex min-h-full items-center justify-center">
        <div
          className={[
            'flex max-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-panel sm:p-8',
            panelClassName ?? '',
          ].join(' ')}
        >
          <div className="mb-6 shrink-0">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
