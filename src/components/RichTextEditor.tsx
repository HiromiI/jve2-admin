import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FiBold,
  FiItalic,
  FiLink,
  FiList,
  FiUnderline,
} from 'react-icons/fi';
import katex from 'katex';
import FormulaEditor from './FormulaEditor';

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

const formulaFontOptions = [
  { label: 'Cambria Math', value: 'Cambria Math, STIX Two Math, Times New Roman, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
] as const;

type FormulaFontFamily = (typeof formulaFontOptions)[number]['value'];

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

function readBraceGroup(source: string, startIndex: number) {
  if (source[startIndex] !== '{') {
    return null;
  }

  let depth = 0;

  for (let index = startIndex; index < source.length; index += 1) {
    const currentChar = source[index];

    if (currentChar === '\\') {
      index += 1;
      continue;
    }

    if (currentChar === '{') {
      depth += 1;
    }

    if (currentChar === '}') {
      depth -= 1;

      if (depth === 0) {
        return {
          value: source.slice(startIndex + 1, index),
          nextIndex: index + 1,
        };
      }
    }
  }

  return null;
}

function renderFormulaText(text: string) {
  return escapeHtml(text)
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\pm/g, '±')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\to/g, '→')
    .replace(/\\infty/g, '∞')
    .replace(/(^|[^A-Za-z0-9>])([A-Za-z0-9])\^\{([^{}]+)\}/g, (_match, prefix, base, exponent) => {
      return `${prefix}<span class="inline-flex items-start gap-0.5 align-baseline"><span>${base}</span><sup class="text-[0.7em] leading-none">${exponent}</sup></span>`;
    })
    .replace(/(^|[^A-Za-z0-9>])([A-Za-z0-9])\^([A-Za-z0-9]+)/g, (_match, prefix, base, exponent) => {
      return `${prefix}<span class="inline-flex items-start gap-0.5 align-baseline"><span>${base}</span><sup class="text-[0.7em] leading-none">${exponent}</sup></span>`;
    })
    .replace(/(^|[^A-Za-z0-9>])([A-Za-z0-9])_\{([^{}]+)\}/g, (_match, prefix, base, subscript) => {
      return `${prefix}<span class="inline-flex items-end gap-0.5 align-baseline"><span>${base}</span><sub class="text-[0.72em] leading-none">${subscript}</sub></span>`;
    })
    .replace(/(^|[^A-Za-z0-9>])([A-Za-z0-9])_([A-Za-z0-9]+)/g, (_match, prefix, base, subscript) => {
      return `${prefix}<span class="inline-flex items-end gap-0.5 align-baseline"><span>${base}</span><sub class="text-[0.72em] leading-none">${subscript}</sub></span>`;
    });
}

function renderFormulaMarkup(source: string, options: { mode: 'inline' | 'block'; fontFamily: FormulaFontFamily }) {
  const renderSegment = (segment: string): string => {
    let html = '';

    for (let index = 0; index < segment.length; ) {
      if (segment.startsWith('\\frac', index)) {
        const numeratorStart = index + '\\frac'.length;
        const numeratorGroup = readBraceGroup(segment, numeratorStart);

        if (!numeratorGroup) {
          html += renderFormulaText(segment.slice(index, index + 5));
          index += 5;
          continue;
        }

        const denominatorGroup = readBraceGroup(segment, numeratorGroup.nextIndex);

        if (!denominatorGroup) {
          html += renderFormulaText(segment.slice(index, numeratorGroup.nextIndex));
          index = numeratorGroup.nextIndex;
          continue;
        }

        const numeratorHtml = renderSegment(numeratorGroup.value);
        const denominatorHtml = renderSegment(denominatorGroup.value);

        html += `
          <span class="inline-flex flex-col items-center align-middle mx-1 text-[1.04em] leading-none">
            <span class="min-w-full border-b border-slate-900 px-2 pb-1 text-center">${numeratorHtml}</span>
            <span class="pt-1 text-center">${denominatorHtml}</span>
          </span>
        `;

        index = denominatorGroup.nextIndex;
        continue;
      }

      if (segment.startsWith('\\sqrt', index)) {
        const radicandStart = index + '\\sqrt'.length;
        const radicandGroup = readBraceGroup(segment, radicandStart);

        if (!radicandGroup) {
          html += renderFormulaText(segment.slice(index, index + 5));
          index += 5;
          continue;
        }

        const radicandHtml = renderSegment(radicandGroup.value);

        html += `
          <span class="inline-flex items-start align-middle mx-1 text-[1.06em] leading-none">
            <span class="text-[1.2em] leading-none">√</span>
            <span class="border-t border-slate-900 pl-1 pt-1">${radicandHtml}</span>
          </span>
        `;

        index = radicandGroup.nextIndex;
        continue;
      }

      if (segment.startsWith('\\begin{bmatrix}', index)) {
        const matrixEnd = segment.indexOf('\\end{bmatrix}', index);

        if (matrixEnd === -1) {
          html += renderFormulaText(segment.slice(index));
          break;
        }

        const matrixContent = segment.slice(index + '\\begin{bmatrix}'.length, matrixEnd).trim();
        const rows = matrixContent
          .split('\\\\')
          .map((row) => row.trim())
          .filter(Boolean)
          .map((row) => row.split('&').map((cell) => renderSegment(cell.trim())));

        html += `
          <span class="inline-flex items-center align-middle mx-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[0.98em] leading-none">
            <span class="mr-2 text-slate-500">[</span>
            <span class="inline-grid gap-x-3 gap-y-1" style="grid-template-columns: repeat(${Math.max(1, rows[0]?.length ?? 1)}, auto);">
              ${rows
                .map((row) => row.map((cell) => `<span class="whitespace-nowrap">${cell}</span>`).join(''))
                .join('')}
            </span>
            <span class="ml-2 text-slate-500">]</span>
          </span>
        `;

        index = matrixEnd + '\\end{bmatrix}'.length;
        continue;
      }

      if (segment[index] === '\\') {
        const commandMatch = segment.slice(index).match(/^\\[a-zA-Z]+/);

        if (commandMatch) {
          html += renderFormulaText(commandMatch[0]);
          index += commandMatch[0].length;
          continue;
        }
      }

      let nextSpecialIndex = segment.length;
      const nextCandidates = ['\\frac', '\\sqrt', '\\begin{bmatrix}', '\\'];

      nextCandidates.forEach((candidate) => {
        const candidateIndex = segment.indexOf(candidate, index + 1);

        if (candidateIndex >= 0) {
          nextSpecialIndex = Math.min(nextSpecialIndex, candidateIndex);
        }
      });

      const plainText = segment.slice(index, nextSpecialIndex);
      html += renderFormulaText(plainText);
      index = nextSpecialIndex;
    }

    return html;
  };

  const renderedSource = renderSegment(source.trim());

  return `
    <div data-formula="${options.mode}" data-formula-source="${escapeHtml(source.trim())}" contenteditable="false" style="display: ${options.mode === 'block' ? 'block' : 'inline-flex'}; width: ${options.mode === 'block' ? '100%' : 'auto'}; justify-content: ${options.mode === 'block' ? 'center' : 'flex-start'}; align-items: center; border-radius: 18px; border: 1px solid #d8e3f0; background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%); padding: ${options.mode === 'block' ? '16px 20px' : '6px 10px'}; font-family: ${options.fontFamily}; font-size: ${options.mode === 'block' ? '1.45em' : '1.12em'}; line-height: 1.6; color: #111827; box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 16px rgba(15, 23, 42, 0.06); overflow-x: auto;">
      <span style="display: inline-flex; align-items: center; justify-content: center; gap: 0.35em; white-space: nowrap; min-width: min-content;">${renderedSource}</span>
    </div>
  `;
}

function RichTextEditor({ id, label, value, error, placeholder, onChange, variant = 'question' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isFormulaBuilderOpen, setIsFormulaBuilderOpen] = useState(false);
  const [formulaDraft, setFormulaDraft] = useState('');
  const [formulaFontFamily, setFormulaFontFamily] = useState<FormulaFontFamily>(formulaFontOptions[0].value);
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
    setFormulaFontFamily(formulaFontOptions[0].value);
  };

  const insertFormula = ({ latex, mode }: { latex: string; mode: 'inline' | 'block' }) => {
    restoreSelection();

    const renderedFormula = katex.renderToString(latex, {
      displayMode: mode === 'block',
      throwOnError: false,
      strict: 'ignore',
    });

    const formulaHtml =
      mode === 'block'
        ? `<div data-math-formula="true" data-math-mode="block" data-latex="${escapeHtml(latex)}" contenteditable="false" style="margin: 12px 0; display: block; overflow-x: auto; text-align: center;">${renderedFormula}</div>`
        : `<span data-math-formula="true" data-math-mode="inline" data-latex="${escapeHtml(latex)}" contenteditable="false" style="display: inline-flex; align-items: center; vertical-align: middle; margin: 0 2px;">${renderedFormula}</span>`;

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

        <FormulaEditor isOpen={isFormulaBuilderOpen} onClose={closeFormulaBuilder} onInsert={insertFormula} />

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
