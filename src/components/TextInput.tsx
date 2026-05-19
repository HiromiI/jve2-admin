import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  label: string;
  error?: string;
  icon?: ReactNode;
}

function TextInput({ label, error, icon, id, ...props }: TextInputProps) {
  const isDisabled = Boolean(props.disabled);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={["text-sm font-medium", isDisabled ? 'text-slate-500' : 'text-slate-700'].join(' ')}>
        {label}
      </label>
      <div
        className={[
          'flex items-center gap-3 rounded-xl border px-4 py-3 transition',
          isDisabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 shadow-inner'
            : 'bg-white shadow-sm',
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : isDisabled
              ? 'border-slate-200'
              : 'border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100',
        ].join(' ')}
      >
        {icon ? <span className={isDisabled ? 'text-slate-300' : 'text-slate-400'}>{icon}</span> : null}
        <input
          id={id}
          className={[
            'w-full border-none bg-transparent outline-none',
            isDisabled
              ? 'cursor-not-allowed text-slate-500 placeholder:text-slate-400'
              : 'text-slate-900 placeholder:text-slate-400',
          ].join(' ')}
          {...props}
        />
      </div>
      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </div>
  );
}

export default TextInput;
