import { FiTrash2, FiUpload } from 'react-icons/fi';

interface ImageUploadFieldProps {
  label: string;
  file: File | null;
  previewUrl: string;
  emptyMessage: string;
  removeButtonLabel: string;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

function getImageDisplayName(file: File | null, previewUrl: string) {
  if (file) {
    return file.name;
  }

  if (!previewUrl) {
    return '';
  }

  const [pathWithoutQuery] = previewUrl.split('?');
  const fileName = pathWithoutQuery.split('/').pop();

  return fileName ? decodeURIComponent(fileName) : 'Imagem atual';
}

function ImageUploadField({
  label,
  file,
  previewUrl,
  emptyMessage,
  removeButtonLabel,
  onChange,
  onRemove,
}: ImageUploadFieldProps) {
  const hasImage = Boolean(file || previewUrl);
  const imageDisplayName = getImageDisplayName(file, previewUrl);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="h-32 w-32 rounded-2xl object-cover shadow-sm sm:h-36 sm:w-36" />
      ) : null}

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
          <FiUpload size={18} />
          Enviar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;

              if (!nextFile) {
                return;
              }

              onChange(nextFile);
              event.target.value = '';
            }}
          />
        </label>

        {hasImage ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="max-w-52 truncate text-sm text-slate-500 sm:max-w-72">{imageDisplayName}</p>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
              aria-label={removeButtonLabel}
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ImageUploadField;
