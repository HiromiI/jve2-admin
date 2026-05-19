import { FiTrash2, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import EntityManagementPage from '../../components/EntityManagementPage';
import { useAuth } from '../../contexts/AuthContext';
import TextInput from '../../components/TextInput';
import TextareaInput from '../../components/TextareaInput';
import type { Course } from '../../interfaces/course';
import { createCourse, deleteCourse, listCourses, updateCourse } from '../../services/courses';

const DUPLICATE_COURSE_ERROR_MESSAGE = 'Curso já cadastrado.';

interface CourseFormValues {
  name: string;
  description: string;
  planCode: string;
  price: string;
  imageFile: File | null;
  imagePreviewUrl: string;
  removeImage: boolean;
}

function formatPriceForInput(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return '';
  }

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizePriceInput(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 12);

  if (!digitsOnly) {
    return '';
  }

  const numericValue = Number(digitsOnly) / 100;

  if (Number.isNaN(numericValue)) {
    return '';
  }

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function serializePrice(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const digitsOnly = trimmedValue.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  return (Number(digitsOnly) / 100).toFixed(2);
}

function formatPriceForDisplay(value: string | null) {
  if (!value) {
    return '—';
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

function buildCourseFormData(values: CourseFormValues) {
  const formData = new FormData();
  const trimmedName = values.name.trim();
  const trimmedDescription = values.description.trim();
  const trimmedPlanCode = values.planCode.trim();
  const serializedPrice = serializePrice(values.price);

  formData.append('name', trimmedName);

  if (trimmedDescription) {
    formData.append('description', trimmedDescription);
  }

  if (trimmedPlanCode) {
    formData.append('planCode', trimmedPlanCode);
  }

  if (serializedPrice) {
    formData.append('price', serializedPrice);
  }

  if (values.imageFile) {
    formData.append('image', values.imageFile);
  }

  if (values.removeImage) {
    formData.append('removeImage', 'true');
  }

  return formData;
}

function getImageDisplayName(values: Pick<CourseFormValues, 'imageFile' | 'imagePreviewUrl'>) {
  if (values.imageFile) {
    return values.imageFile.name;
  }

  if (!values.imagePreviewUrl) {
    return '';
  }

  const [pathWithoutQuery] = values.imagePreviewUrl.split('?');
  const fileName = pathWithoutQuery.split('/').pop();

  return fileName ? decodeURIComponent(fileName) : 'Banner atual';
}

function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  return (
    <EntityManagementPage<Course, CourseFormValues>
      title="Gerenciamento de Cursos"
      createButtonLabel="Cadastrar Novo Curso"
      createDialogTitle="Cadastrar Novo Curso"
      editDialogTitle="Editar Curso"
      deleteDialogTitle="Excluir Curso"
      emptyStateMessage="Nenhum Curso cadastrado."
      loadEntities={listCourses}
      createEntity={(values) => createCourse(buildCourseFormData(values))}
      updateEntity={(id, values) => updateCourse(id, buildCourseFormData(values))}
      deleteEntity={deleteCourse}
      getItemLabel={(course) => course.name}
      getCreateInitialValues={() => ({
        name: '',
        description: '',
        planCode: '',
        price: '',
        imageFile: null,
        imagePreviewUrl: '',
        removeImage: false,
      })}
      getEditInitialValues={(course) => ({
        name: course.name,
        description: course.description ?? '',
        planCode: course.planCode ?? '',
        price: formatPriceForInput(course.price),
        imageFile: null,
        imagePreviewUrl: course.image ?? '',
        removeImage: false,
      })}
      validate={(values) => ({
        name: values.name.trim() ? '' : 'Campo obrigatório.',
        description: '',
        planCode: '',
        price:
          values.planCode.trim() && !serializePrice(values.price)
            ? 'Campo obrigatório.'
            : values.price.trim() && !serializePrice(values.price)
              ? 'Campo obrigatório.'
              : '',
        imageFile: '',
        imagePreviewUrl: '',
        removeImage: '',
      })}
      renderForm={({ values, errors, setFieldValue, dialogState }) => {
        const hasImage = Boolean(values.imageFile || values.imagePreviewUrl);
        const imageDisplayName = getImageDisplayName(values);

        return (
          <div className="space-y-4">
            <TextInput
              id="course-name"
              name="course-name"
              label="Nome"
              type="text"
              placeholder="Digite o nome do Curso"
              value={values.name}
              onChange={(event) => setFieldValue('name', event.target.value)}
              maxLength={255}
              error={errors.name}
            />

            <TextareaInput
              id="course-description"
              name="course-description"
              label="Descrição"
              placeholder="Digite a descrição"
              value={values.description}
              onChange={(event) => setFieldValue('description', event.target.value)}
              maxLength={1000}
              error={errors.description}
            />

            <TextInput
              id="course-plan-code"
              name="course-plan-code"
              label="Código do Plano"
              type="text"
              placeholder="Digite o código do plano"
              value={values.planCode}
              onChange={(event) => setFieldValue('planCode', event.target.value)}
              maxLength={255}
              error={errors.planCode}
            />

            <TextInput
              id="course-price"
              name="course-price"
              label="Preço Mensal (R$)"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={values.price}
              onChange={(event) => setFieldValue('price', normalizePriceInput(event.target.value))}
              error={errors.price}
              icon={<span className="text-sm font-semibold text-slate-500">R$</span>}
            />

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
              {values.imagePreviewUrl ? (
                <img
                  src={values.imagePreviewUrl}
                  alt="Banner do Curso"
                  className="h-40 w-40 rounded-2xl object-cover shadow-sm sm:h-44 sm:w-44"
                />
              ) : null}

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-slate-700">Banner</p>
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

                      setFieldValue('imageFile', nextFile);
                      setFieldValue('imagePreviewUrl', URL.createObjectURL(nextFile));
                      setFieldValue('removeImage', false);
                      event.target.value = '';
                    }}
                  />
                </label>

                {hasImage ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <p className="max-w-52 truncate text-sm text-slate-500 sm:max-w-72">{imageDisplayName}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFieldValue('imageFile', null);
                        setFieldValue('imagePreviewUrl', '');
                        setFieldValue('removeImage', dialogState?.type === 'edit');
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                      aria-label="Remover banner"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Nenhum banner selecionado.</p>
                )}
              </div>
            </div>
          </div>
        );
      }}
      deleteConfirmationMessage={(course) => `Tem certeza que deseja excluir o item ${course.name}?`}
      successMessages={{
        create: 'Curso cadastrado com sucesso.',
        update: 'Curso editado com sucesso.',
        delete: 'Curso excluído com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar um novo Curso. Tente novamente.',
        update: 'Erro ao editar o Curso. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
      isCreateDisabled={isProfessor}
      isEditDisabled={() => isProfessor}
      isDeleteDisabled={() => isProfessor}
      shouldDisableSaveForAlert={(message) => message === DUPLICATE_COURSE_ERROR_MESSAGE}
      renderItemContent={(course) => (
        <div className="grid flex-1 gap-4 sm:grid-cols-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Curso</p>
            <p className="truncate text-base font-semibold text-slate-800">{course.name}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
            <p className="mt-1 line-clamp-4 text-base font-semibold text-slate-800">{course.description ?? '—'}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Código do Plano</p>
            <p className="truncate text-base font-semibold text-slate-800">{course.planCode ?? '—'}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preço Mensal (R$)</p>
            <p className="truncate text-base font-semibold text-slate-800">{formatPriceForDisplay(course.price)}</p>
          </div>
        </div>
      )}
      renderItemActions={(course) => (
        <button
          type="button"
          onClick={() => navigate(`/courses/${course.id}/subjects`, { state: { courseName: course.name } })}
          className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Disciplinas
        </button>
      )}
    />
  );
}

export default CoursesPage;
