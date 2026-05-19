import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FiBold,
  FiItalic,
  FiLink,
  FiList,
  FiUnderline,
} from 'react-icons/fi';

interface RichTextEditorProps {
  id?: string;
  label?: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  variant?: 'question' | 'alternative';
}

type EditorCommand =
  | { type: 'exec'; command: string; value?: string }
  | { type: 'link' }
  | { type: 'formula' };

interface ToolbarButton {
  key: string;
  icon: ReactNode;
  label: string;
  command: EditorCommand;
}

const orderedListIcon = <span className="text-xs font-bold">1.</span>;
const strikethroughIcon = <span className="text-xs font-semibold line-through">abc</span>;
const formulaIcon = <span className="text-xs font-bold">∑x</span>;
const indentDecreaseIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4.25H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M6 7.25H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 10.25H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M6 13.25H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M6 8L3 5.5V10.5L6 8Z" fill="currentColor" />
  </svg>
);
const indentIncreaseIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4.25H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 7.25H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 10.25H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 13.25H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M10 8L13 10.5V5.5L10 8Z" fill="currentColor" />
  </svg>
);

const formulaTemplateOptions = [
  { label: 'Fração', value: '\\frac{}{}' },
  { label: 'Raiz', value: '\\sqrt{}' },
  { label: 'Potência', value: 'x^{}' },
  { label: 'Índice', value: 'x_{}' },
  { label: 'Somatório', value: '\\sum_{n=1}^{}' },
  { label: 'Integral', value: '\\int_{}^{}' },
  { label: 'Limite', value: '\\lim_{x \\to }' },
  { label: 'Matriz', value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
] as const;

const formulaSymbolOptions = ['\\alpha', '\\beta', '\\gamma', '\\theta', '\\pi', '\\ge', '\\le', '\\neq', '\\cdot', '\\times'];

const questionToolbarButtons: ToolbarButton[] = [
  {
    key: 'bold',
    icon: <FiBold size={16} />,
    label: 'Negrito',
    command: { type: 'exec', command: 'bold' },
  },
  {
    key: 'italic',
    icon: <FiItalic size={16} />,
    label: 'Itálico',
    command: { type: 'exec', command: 'italic' },
  },
  {
    key: 'underline',
    icon: <FiUnderline size={16} />,
    label: 'Sublinhado',
    command: { type: 'exec', command: 'underline' },
  },
  {
    key: 'strikethrough',
    icon: strikethroughIcon,
    label: 'Tachado',
    command: { type: 'exec', command: 'strikeThrough' },
  },
  {
    key: 'superscript',
    icon: <span className="text-xs font-bold">X²</span>,
    label: 'Sobrescrito',
    command: { type: 'exec', command: 'superscript' },
  },
  {
    key: 'subscript',
    icon: <span className="text-xs font-bold">X₂</span>,
    label: 'Subscrito',
    command: { type: 'exec', command: 'subscript' },
  },
  {
    key: 'unorderedList',
    icon: <FiList size={16} />,
    label: 'Lista com bullets',
    command: { type: 'exec', command: 'insertUnorderedList' },
  },
  {
    key: 'orderedList',
    icon: orderedListIcon,
    label: 'Lista numerada',
    command: { type: 'exec', command: 'insertOrderedList' },
  },
  {
    key: 'outdent',
    icon: indentDecreaseIcon,
    label: 'Diminuir identação',
    command: { type: 'exec', command: 'outdent' },
  },
  {
    key: 'indent',
    icon: indentIncreaseIcon,
    label: 'Aumentar identação',
    command: { type: 'exec', command: 'indent' },
  },
  {
    key: 'link',
    icon: <FiLink size={16} />,
    label: 'Inserir hiperlink',
    command: { type: 'link' },
  },
  {
    key: 'formula',
    icon: formulaIcon,
    label: 'Inserir fórmula',
    command: { type: 'formula' },
  },
];

const alternativeToolbarButtons: ToolbarButton[] = [
  {
    key: 'bold',
    icon: <FiBold size={16} />,
    label: 'Negrito',
    command: { type: 'exec', command: 'bold' },
  },
  {
    key: 'italic',
    icon: <FiItalic size={16} />,
    label: 'Itálico',
    command: { type: 'exec', command: 'italic' },
  },
  {
    key: 'underline',
    icon: <FiUnderline size={16} />,
    label: 'Sublinhado',
    command: { type: 'exec', command: 'underline' },
  },
  {
    key: 'strikethrough',
    icon: strikethroughIcon,
    label: 'Tachado',
    command: { type: 'exec', command: 'strikeThrough' },
  },
  {
    key: 'superscript',
    icon: <span className="text-xs font-bold">X²</span>,
    label: 'Sobrescrito',
    command: { type: 'exec', command: 'superscript' },
  },
  {
    key: 'subscript',
    icon: <span className="text-xs font-bold">X₂</span>,
    label: 'Subscrito',
    command: { type: 'exec', command: 'subscript' },
  },
  {
    key: 'formula',
    icon: formulaIcon,
    label: 'Inserir fórmula',
    command: { type: 'formula' },
  },
];

function normalizeHtml(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === '<br>' || trimmedValue === '<div><br></div>' || trimmedValue === '<p><br></p>') {
    return '';
  }

  return value;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function RichTextEditor({ id, label, value, error, placeholder, onChange, variant = 'question' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isFormulaBuilderOpen, setIsFormulaBuilderOpen] = useState(false);
  const [formulaDraft, setFormulaDraft] = useState('');
  const toolbarButtons = useMemo(
    () => (variant === 'question' ? questionToolbarButtons : alternativeToolbarButtons),
    [variant],
  );
  const isEmpty = stripHtml(value).length === 0;

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const normalizedValue = normalizeHtml(value);

    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [value]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const saveSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      savedSelectionRef.current = null;
      return;
    }

    const nextRange = selection.getRangeAt(0);

    if (!editorRef.current?.contains(nextRange.commonAncestorContainer)) {
      savedSelectionRef.current = null;
      return;
    }

    savedSelectionRef.current = nextRange.cloneRange();
  };

  const restoreSelection = () => {
    focusEditor();

    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    selection.removeAllRanges();

    if (savedSelectionRef.current) {
      selection.addRange(savedSelectionRef.current);
      return;
    }

    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  };

  const handleInput = () => {
    onChange(normalizeHtml(editorRef.current?.innerHTML ?? ''));
  };

  const closeFormulaBuilder = () => {
    setIsFormulaBuilderOpen(false);
    setFormulaDraft('');
  };

  const insertFormula = (mode: 'inline' | 'block') => {
    const trimmedFormula = formulaDraft.trim();

    if (!trimmedFormula) {
      return;
    }

    restoreSelection();

    const escapedFormula = escapeHtml(trimmedFormula);
    const formulaHtml =
      mode === 'block'
        ? `<div data-formula="block" style="margin: 8px 0; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 8px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;">\\[${escapedFormula}\\]</div>`
        : `<span data-formula="inline" style="display: inline-block; margin: 0 2px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 1px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;">\\(${escapedFormula}\\)</span>`;

    document.execCommand('insertHTML', false, formulaHtml);
    handleInput();
    closeFormulaBuilder();
  };

  const executeCommand = (command: EditorCommand) => {
    focusEditor();

    if (command.type === 'link') {
      const url = window.prompt('Informe a URL do hiperlink:');

      if (!url?.trim()) {
        return;
      }

      document.execCommand('createLink', false, url.trim());
      handleInput();
      return;
    }

    if (command.type === 'formula') {
      saveSelection();
      setIsFormulaBuilderOpen(true);
      return;
    }

    document.execCommand(command.command, false, command.value);
    handleInput();
  };

  return (
    <div className="flex flex-col gap-2">
      {label ? <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label> : null}

      <div className={[
        'rounded-xl border bg-white shadow-sm transition',
        error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100',
      ].join(' ')}>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-3">
          {variant === 'question' ? (
            <select
              aria-label="Tamanho do texto"
              defaultValue=""
              onChange={(event) => {
                const nextValue = event.target.value;

                if (!nextValue) {
                  return;
                }

                executeCommand({ type: 'exec', command: 'fontSize', value: nextValue });
                event.target.value = '';
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="">Tamanho</option>
              <option value="2">Pequeno</option>
              <option value="3">Normal</option>
              <option value="5">Grande</option>
              <option value="7">Muito grande</option>
            </select>
          ) : null}

          {toolbarButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => executeCommand(button.command)}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              aria-label={button.label}
              title={button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {isFormulaBuilderOpen ? (
          <div className="space-y-4 border-b border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Construtor de fórmula</p>
                <p className="text-xs text-slate-500">Use sintaxe matemática e atalhos para montar fórmulas inline ou em bloco.</p>
              </div>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={closeFormulaBuilder}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Fechar
              </button>
            </div>

            <textarea
              value={formulaDraft}
              onChange={(event) => setFormulaDraft(event.target.value)}
              placeholder="Exemplo: \\frac{x^2 + 1}{\\sqrt{y}}"
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modelos rápidos</p>
              <div className="flex flex-wrap gap-2">
                {formulaTemplateOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setFormulaDraft((currentValue) => `${currentValue}${currentValue ? ' ' : ''}${option.value}`)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Símbolos</p>
              <div className="flex flex-wrap gap-2">
                {formulaSymbolOptions.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setFormulaDraft((currentValue) => `${currentValue}${currentValue ? ' ' : ''}${symbol}`)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prévia do código</p>
              <code className="mt-2 block whitespace-pre-wrap break-words text-sm text-slate-700">
                {formulaDraft.trim() ? formulaDraft : '\\frac{a+b}{c}'}
              </code>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertFormula('inline')}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Inserir inline
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertFormula('block')}
                className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Inserir em bloco
              </button>
            </div>
          </div>
        ) : null}

        <div className="relative">
          {isEmpty && placeholder ? (
            <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">{placeholder}</span>
          ) : null}

          <div
            id={id}
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-40 w-full overflow-y-auto px-4 py-4 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>

      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </div>
  );
}

export default RichTextEditor;
