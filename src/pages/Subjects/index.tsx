import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EntityManagementPage from '../../components/EntityManagementPage';
import { useAuth } from '../../contexts/AuthContext';
import TextInput from '../../components/TextInput';
import TextareaInput from '../../components/TextareaInput';
import type { Subject } from '../../interfaces/subject';
import { getCourseById } from '../../services/courses';
import { createSubject, deleteSubject, listSubjects, updateSubject } from '../../services/subjects';

interface SubjectFormValues {
  name: string;
  description: string;
}

interface SubjectsLocationState {
  courseName?: string;
}

function SubjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const courseId = Number(courseIdParam);
  const locationState = location.state as SubjectsLocationState | null;
  const [courseName, setCourseName] = useState(locationState?.courseName?.trim() ?? '');
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [hasCourseLoadError, setHasCourseLoadError] = useState(false);
  const isProfessor = user?.role === 'professor';
  const allowedSubjectIds = useMemo(() => new Set(user?.subjectIds ?? []), [user?.subjectIds]);

  const loadCourse = useCallback(async () => {
    if (!Number.isInteger(courseId) || courseId <= 0) {
      setHasCourseLoadError(true);
      setIsCourseLoading(false);
      return;
    }

    setIsCourseLoading(true);
    setHasCourseLoadError(false);

    try {
      const course = await getCourseById(courseId);
      setCourseName(course.name);
    } catch {
      setHasCourseLoadError(true);
    } finally {
      setIsCourseLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const duplicateSubjectErrorMessage = useMemo(
    () => `Disciplina já cadastrada para o curso ${courseName}.`,
    [courseName],
  );

  if (isCourseLoading) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 items-center justify-center text-base font-semibold text-slate-600">
          Carregando...
        </div>
      </section>
    );
  }

  if (hasCourseLoadError || !courseName) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-medium text-slate-600">Erro ao carregar dados.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadCourse()}
              className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Recarregar
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Voltar para Cursos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <EntityManagementPage<Subject, SubjectFormValues>
      title={courseName}
      subtitle="Gerenciamento de Disciplinas"
      createButtonLabel="Cadastrar Nova Disciplina"
      createDialogTitle="Cadastrar Nova Disciplina"
      editDialogTitle="Editar Disciplina"
      deleteDialogTitle="Excluir Disciplina"
      emptyStateMessage="Nenhuma Disciplina cadastrada."
      loadEntities={({ limit, offset }) => listSubjects(courseId, { limit, offset })}
      createEntity={(values) =>
        createSubject(
          courseId,
          {
            name: values.name.trim(),
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
          },
          `Erro ao cadastrar uma nova Disciplina para o curso ${courseName}. Tente novamente.`,
        )
      }
      updateEntity={(id, values) =>
        updateSubject(
          courseId,
          id,
          {
            name: values.name.trim(),
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
          },
          `Erro ao editar a Disciplina do curso ${courseName}. Tente novamente.`,
        )
      }
      deleteEntity={(id) => deleteSubject(courseId, id)}
      getItemLabel={(subject) => subject.name}
      getCreateInitialValues={() => ({
        name: '',
        description: '',
      })}
      getEditInitialValues={(subject) => ({
        name: subject.name,
        description: subject.description ?? '',
      })}
      validate={(values) => ({
        name: values.name.trim() ? '' : 'Campo obrigatório.',
        description: '',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <div className="space-y-4">
          <TextInput
            id="subject-name"
            name="subject-name"
            label="Nome"
            type="text"
            placeholder="Digite o nome da Disciplina"
            value={values.name}
            onChange={(event) => setFieldValue('name', event.target.value)}
            maxLength={255}
            error={errors.name}
          />

          <TextareaInput
            id="subject-description"
            name="subject-description"
            label="Descrição"
            placeholder="Digite a descrição"
            value={values.description}
            onChange={(event) => setFieldValue('description', event.target.value)}
            error={errors.description}
          />
        </div>
      )}
      deleteConfirmationMessage={(subject) => `Tem certeza que deseja excluir o item ${subject.name}?`}
      successMessages={{
        create: 'Disciplina cadastrada com sucesso.',
        update: 'Disciplina editada com sucesso.',
        delete: 'Disciplina excluída com sucesso.',
      }}
      errorMessages={{
        create: `Erro ao cadastrar uma nova Disciplina para o curso ${courseName}. Tente novamente.`,
        update: `Erro ao editar a Disciplina do curso ${courseName}. Tente novamente.`,
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
      isCreateDisabled={isProfessor}
      isEditDisabled={() => isProfessor}
      isDeleteDisabled={() => isProfessor}
      shouldDisableSaveForAlert={(message) => message === duplicateSubjectErrorMessage}
      renderItemContent={(subject) => (
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disciplina</p>
            <p className="truncate text-base font-semibold text-slate-800">{subject.name}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
            <p className="mt-1 line-clamp-4 text-base font-semibold text-slate-800">{subject.description ?? '—'}</p>
          </div>
        </div>
      )}
      renderItemActions={(subject) => {
        const canAccessQuestions = !isProfessor || allowedSubjectIds.has(subject.id);

        return (
          <>
            <button
              type="button"
              onClick={() =>
                navigate(`/courses/${courseId}/subjects/${subject.id}/skills`, {
                  state: { subjectName: subject.name },
                })
              }
              disabled={isProfessor}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold text-white transition',
                isProfessor
                  ? 'cursor-not-allowed bg-sky-300 opacity-60'
                  : 'bg-sky-500 hover:bg-sky-600',
              ].join(' ')}
            >
              Skills
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/courses/${courseId}/subjects/${subject.id}/questions`, {
                  state: { subjectName: subject.name },
                })
              }
              disabled={!canAccessQuestions}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold text-white transition',
                canAccessQuestions
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-blue-300 opacity-60',
              ].join(' ')}
            >
              Questões
            </button>
          </>
        );
      }}
    />
  );
}

export default SubjectsPage;
