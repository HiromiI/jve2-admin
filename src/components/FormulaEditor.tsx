import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import katex from 'katex';

interface FormulaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (payload: { latex: string; mode: 'inline' | 'block' }) => void;
}

type FormulaMode = 'inline' | 'block';

type MathFieldElementLike = HTMLElement & {
  value: string;
  focus: () => void;
};

const defaultLatex = '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';

const templateButtons = [
  { label: 'Fração', value: '\\frac{}{}' },
  { label: 'Raiz', value: '\\sqrt{}' },
  { label: 'Potência', value: 'x^{}' },
  { label: 'Índice', value: 'x_{}' },
  { label: 'Somatório', value: '\\sum_{n=1}^{}' },
  { label: 'Integral', value: '\\int_{}^{}' },
  { label: 'Matriz', value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
] as const;

const symbolButtons = [
  '\\alpha',
  '\\beta',
  '\\gamma',
  '\\theta',
  '\\pi',
  '\\pm',
  '\\ge',
  '\\le',
  '\\neq',
  '\\cdot',
  '\\times',
] as const;

function FormulaEditor({ isOpen, onClose, onInsert }: FormulaEditorProps) {
  const mathFieldRef = useRef<MathFieldElementLike | null>(null);
  const [latex, setLatex] = useState(defaultLatex);
  const [mode, setMode] = useState<FormulaMode>('inline');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLatex(defaultLatex);
    setMode('inline');

    window.setTimeout(() => {
      mathFieldRef.current?.focus();
    }, 0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mathFieldRef.current) {
      return;
    }

    if (mathFieldRef.current.value !== latex) {
      mathFieldRef.current.value = latex;
    }
  }, [isOpen, latex]);

  const renderedPreview = useMemo(() => {
    const nextLatex = latex.trim() || defaultLatex;

    return katex.renderToString(nextLatex, {
      displayMode: mode === 'block',
      throwOnError: false,
      strict: 'ignore',
    });
  }, [latex, mode]);

  const insertSnippet = (snippet: string) => {
    setLatex((currentValue) => {
      const nextValue = currentValue.trim() ? `${currentValue} ${snippet}` : snippet;
      window.setTimeout(() => {
        if (mathFieldRef.current) {
          mathFieldRef.current.value = nextValue;
          mathFieldRef.current.focus();
        }
      }, 0);
      return nextValue;
    });
  };

  const handleInsert = () => {
    onInsert({
      latex: latex.trim() || defaultLatex,
      mode,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/55 px-4 py-6">
      <div className="flex min-h-full items-center justify-center">
        <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-panel">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Editor de fórmula</h2>
              <p className="text-sm text-slate-500">
                Monte a expressão matemática visualmente e insira em qualquer posição do texto.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Fechar
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Composição visual</p>
                    <p className="text-xs text-slate-500">Digite a fórmula como no editor matemático.</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setMode('inline')}
                      className={[
                        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                        mode === 'inline' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500',
                      ].join(' ')}
                    >
                      Inline
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('block')}
                      className={[
                        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                        mode === 'block' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500',
                      ].join(' ')}
                    >
                      Em bloco
                    </button>
                  </div>
                </div>

                <math-field
                  ref={(node: HTMLElement | null) => {
                    mathFieldRef.current = node as MathFieldElementLike | null;
                  }}
                  onInput={(event: FormEvent<HTMLElement>) => {
                    const nextValue = (event.currentTarget as MathFieldElementLike).value;
                    setLatex(nextValue);
                  }}
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[1.15rem] text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modelos rápidos</p>
                  <div className="flex flex-wrap gap-2">
                    {templateButtons.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertSnippet(option.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Símbolos</p>
                  <div className="flex flex-wrap gap-2">
                    {symbolButtons.map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertSnippet(symbol)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prévia visual</p>
                  <div className="overflow-x-auto rounded-2xl bg-slate-50 px-4 py-5 text-slate-900">
                    <div
                      className="mx-auto w-fit max-w-full"
                      dangerouslySetInnerHTML={{ __html: renderedPreview }}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">LaTeX</p>
                    <code className="mt-2 block whitespace-pre-wrap break-words text-sm text-slate-700">
                      {latex.trim() || defaultLatex}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleInsert}
                  className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Inserir fórmula
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormulaEditor;
