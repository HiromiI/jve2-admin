import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
  name?: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  options: SelectOption[];
}

function SelectInput({ label, error, icon, id, options, ...props }: SelectInputProps) {
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
        <select
          id={id}
          className={[
            'w-full border-none bg-transparent outline-none',
            isDisabled ? 'cursor-not-allowed text-slate-500' : 'text-slate-900',
          ].join(' ')}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </div>
  );
}

export default SelectInput;
