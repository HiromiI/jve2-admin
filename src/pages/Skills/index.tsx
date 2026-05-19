import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EntityManagementPage from '../../components/EntityManagementPage';
import TextInput from '../../components/TextInput';
import TextareaInput from '../../components/TextareaInput';
import type { Skill } from '../../interfaces/skill';
import { getSubjectById } from '../../services/subjects';
import { createSkill, deleteSkill, listSkills, updateSkill } from '../../services/skills';

interface SkillFormValues {
  name: string;
  description: string;
}

interface SkillsLocationState {
  subjectName?: string;
}

function SkillsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: courseIdParam, subjectId: subjectIdParam } = useParams<{ courseId: string; subjectId: string }>();
  const courseId = Number(courseIdParam);
  const subjectId = Number(subjectIdParam);
  const locationState = location.state as SkillsLocationState | null;
  const [subjectName, setSubjectName] = useState(locationState?.subjectName?.trim() ?? '');
  const [isSubjectLoading, setIsSubjectLoading] = useState(true);
  const [hasSubjectLoadError, setHasSubjectLoadError] = useState(false);

  const loadSubject = useCallback(async () => {
    if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(subjectId) || subjectId <= 0) {
      setHasSubjectLoadError(true);
      setIsSubjectLoading(false);
      return;
    }

    setIsSubjectLoading(true);
    setHasSubjectLoadError(false);

    try {
      const subject = await getSubjectById(courseId, subjectId);
      setSubjectName(subject.name);
    } catch {
      setHasSubjectLoadError(true);
    } finally {
      setIsSubjectLoading(false);
    }
  }, [courseId, subjectId]);

  useEffect(() => {
    void loadSubject();
  }, [loadSubject]);

  const duplicateSkillErrorMessage = useMemo(
    () => `Skill já cadastrada para a disciplina ${subjectName}.`,
    [subjectName],
  );

  if (isSubjectLoading) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 items-center justify-center text-base font-semibold text-slate-600">
          Carregando...
        </div>
      </section>
    );
  }

  if (hasSubjectLoadError || !subjectName) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-medium text-slate-600">Erro ao carregar dados.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadSubject()}
              className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Recarregar
            </button>
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseId}/subjects`)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Voltar para Disciplinas
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <EntityManagementPage<Skill, SkillFormValues>
      title={subjectName}
      subtitle="Gerenciamento de Skills"
      createButtonLabel="Cadastrar Nova Skill"
      createDialogTitle="Cadastrar Nova Skill"
      editDialogTitle="Editar Skill"
      deleteDialogTitle="Excluir Skill"
      emptyStateMessage="Nenhuma Skill cadastrada."
      loadEntities={({ limit, offset }) => listSkills(courseId, subjectId, { limit, offset })}
      createEntity={(values) =>
        createSkill(
          courseId,
          subjectId,
          {
            name: values.name.trim(),
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
          },
          `Erro ao cadastrar uma nova Skill para a disciplina ${subjectName}. Tente novamente.`,
        )
      }
      updateEntity={(id, values) =>
        updateSkill(
          courseId,
          subjectId,
          id,
          {
            name: values.name.trim(),
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
          },
          `Erro ao editar a Skill da disciplina ${subjectName}. Tente novamente.`,
        )
      }
      deleteEntity={(id) => deleteSkill(courseId, subjectId, id)}
      getItemLabel={(skill) => skill.name}
      getCreateInitialValues={() => ({
        name: '',
        description: '',
      })}
      getEditInitialValues={(skill) => ({
        name: skill.name,
        description: skill.description ?? '',
      })}
      validate={(values) => ({
        name: values.name.trim() ? '' : 'Campo obrigatório.',
        description: '',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <div className="space-y-4">
          <TextInput
            id="skill-name"
            name="skill-name"
            label="Nome"
            type="text"
            placeholder="Digite o nome da Skill"
            value={values.name}
            onChange={(event) => setFieldValue('name', event.target.value)}
            maxLength={255}
            error={errors.name}
          />

          <TextareaInput
            id="skill-description"
            name="skill-description"
            label="Descrição"
            placeholder="Digite a descrição"
            value={values.description}
            onChange={(event) => setFieldValue('description', event.target.value)}
            error={errors.description}
          />
        </div>
      )}
      deleteConfirmationMessage={(skill) => `Tem certeza que deseja excluir o item ${skill.name}?`}
      successMessages={{
        create: 'Skill cadastrada com sucesso.',
        update: 'Skill editada com sucesso.',
        delete: 'Skill excluída com sucesso.',
      }}
      errorMessages={{
        create: `Erro ao cadastrar uma nova Skill para a disciplina ${subjectName}. Tente novamente.`,
        update: `Erro ao editar a Skill da disciplina ${subjectName}. Tente novamente.`,
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
      shouldDisableSaveForAlert={(message) => message === duplicateSkillErrorMessage}
      renderItemContent={(skill) => (
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skill</p>
            <p className="truncate text-base font-semibold text-slate-800">{skill.name}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
            <p className="mt-1 line-clamp-4 text-base font-semibold text-slate-800">{skill.description ?? '—'}</p>
          </div>
        </div>
      )}
    />
  );
}

export default SkillsPage;
