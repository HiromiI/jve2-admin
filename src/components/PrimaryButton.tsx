import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

function PrimaryButton({ children, className = '', isLoading = false, disabled, ...props }: PropsWithChildren<PrimaryButtonProps>) {
  return (
    <button
      className={[
        'flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold text-white transition',
        disabled || isLoading ? 'cursor-not-allowed bg-slate-300' : 'bg-brand-600 hover:bg-brand-700',
        className,
      ].join(' ')}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Entrando...' : children}
    </button>
  );
}

export default PrimaryButton;
