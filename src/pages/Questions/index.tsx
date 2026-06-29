import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EntityManagementPage from '../../components/EntityManagementPage';
import ImageUploadField from '../../components/ImageUploadField';
import RichTextEditor from '../../components/RichTextEditor';
import SelectInput from '../../components/SelectInput';
import TextInput from '../../components/TextInput';
import type { Board } from '../../interfaces/board';
import type { EducationalLevel } from '../../interfaces/educationalLevel';
import type { Institution } from '../../interfaces/institution';
import type { Question } from '../../interfaces/question';
import type { Role } from '../../interfaces/role';
import type { Skill } from '../../interfaces/skill';
import { listBoards } from '../../services/boards';
import { listEducationalLevels } from '../../services/educationalLevels';
import { listInstitutions } from '../../services/institutions';
import { createQuestion, deleteQuestion, listQuestions, updateQuestion } from '../../services/questions';
import { listRoles } from '../../services/roles';
import { listSkills } from '../../services/skills';
import { getSubjectById } from '../../services/subjects';

interface QuestionsLocationState {
  subjectName?: string;
}

interface QuestionFilters {
  roleId: string;
  boardId: string;
  institutionId: string;
  educationalLevelId: string;
  year: string;
  search: string;
}

const ALTERNATIVE_CONFIGS = [
  {
    number: 1,
    textField: 'alternative1',
    imageFileField: 'alternative1ImageFile',
    imagePreviewField: 'alternative1ImagePreviewUrl',
    removeImageField: 'removeAlternative1Image',
    apiImageField: 'alternative1Image',
  },
  {
    number: 2,
    textField: 'alternative2',
    imageFileField: 'alternative2ImageFile',
    imagePreviewField: 'alternative2ImagePreviewUrl',
    removeImageField: 'removeAlternative2Image',
    apiImageField: 'alternative2Image',
  },
  {
    number: 3,
    textField: 'alternative3',
    imageFileField: 'alternative3ImageFile',
    imagePreviewField: 'alternative3ImagePreviewUrl',
    removeImageField: 'removeAlternative3Image',
    apiImageField: 'alternative3Image',
  },
  {
    number: 4,
    textField: 'alternative4',
    imageFileField: 'alternative4ImageFile',
    imagePreviewField: 'alternative4ImagePreviewUrl',
    removeImageField: 'removeAlternative4Image',
    apiImageField: 'alternative4Image',
  },
  {
    number: 5,
    textField: 'alternative5',
    imageFileField: 'alternative5ImageFile',
    imagePreviewField: 'alternative5ImagePreviewUrl',
    removeImageField: 'removeAlternative5Image',
    apiImageField: 'alternative5Image',
  },
] as const;

type AlternativeConfig = (typeof ALTERNATIVE_CONFIGS)[number];

interface QuestionFormValues {
  roleId: string;
  boardId: string;
  institutionId: string;
  educationalLevelId: string;
  year: string;
  question: string;
  imageFile: File | null;
  imagePreviewUrl: string;
  removeImage: boolean;
  correctAlternative: string;
  alternative1: string;
  alternative1ImageFile: File | null;
  alternative1ImagePreviewUrl: string;
  removeAlternative1Image: boolean;
  alternative2: string;
  alternative2ImageFile: File | null;
  alternative2ImagePreviewUrl: string;
  removeAlternative2Image: boolean;
  alternative3: string;
  alternative3ImageFile: File | null;
  alternative3ImagePreviewUrl: string;
  removeAlternative3Image: boolean;
  alternative4: string;
  alternative4ImageFile: File | null;
  alternative4ImagePreviewUrl: string;
  removeAlternative4Image: boolean;
  alternative5: string;
  alternative5ImageFile: File | null;
  alternative5ImagePreviewUrl: string;
  removeAlternative5Image: boolean;
  skillIds: number[];
}

function stripRichText(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAlternativeContent(text: string, imagePreviewUrl: string, imageFile: File | null) {
  return Boolean(stripRichText(text) || imagePreviewUrl || imageFile);
}

function getCorrectAlternative(question: Question) {
  const entries = [
    question.alternative1Correct,
    question.alternative2Correct,
    question.alternative3Correct,
    question.alternative4Correct,
    question.alternative5Correct,
  ];
  const index = entries.findIndex((value) => value === 'Y');
  return index >= 0 ? String(index + 1) : '';
}

function getCreateInitialValues(): QuestionFormValues {
  return {
    roleId: '',
    boardId: '',
    institutionId: '',
    educationalLevelId: '',
    year: '',
    question: '',
    imageFile: null,
    imagePreviewUrl: '',
    removeImage: false,
    correctAlternative: '',
    alternative1: '',
    alternative1ImageFile: null,
    alternative1ImagePreviewUrl: '',
    removeAlternative1Image: false,
    alternative2: '',
    alternative2ImageFile: null,
    alternative2ImagePreviewUrl: '',
    removeAlternative2Image: false,
    alternative3: '',
    alternative3ImageFile: null,
    alternative3ImagePreviewUrl: '',
    removeAlternative3Image: false,
    alternative4: '',
    alternative4ImageFile: null,
    alternative4ImagePreviewUrl: '',
    removeAlternative4Image: false,
    alternative5: '',
    alternative5ImageFile: null,
    alternative5ImagePreviewUrl: '',
    removeAlternative5Image: false,
    skillIds: [],
  };
}

function getEditInitialValues(question: Question): QuestionFormValues {
  return {
    roleId: String(question.roleId),
    boardId: String(question.boardId),
    institutionId: String(question.institutionId),
    educationalLevelId: String(question.educationalLevelId),
    year: String(question.year),
    question: question.question,
    imageFile: null,
    imagePreviewUrl: question.image ?? '',
    removeImage: false,
    correctAlternative: getCorrectAlternative(question),
    alternative1: question.alternative1,
    alternative1ImageFile: null,
    alternative1ImagePreviewUrl: question.alternative1Image ?? '',
    removeAlternative1Image: false,
    alternative2: question.alternative2,
    alternative2ImageFile: null,
    alternative2ImagePreviewUrl: question.alternative2Image ?? '',
    removeAlternative2Image: false,
    alternative3: question.alternative3,
    alternative3ImageFile: null,
    alternative3ImagePreviewUrl: question.alternative3Image ?? '',
    removeAlternative3Image: false,
    alternative4: question.alternative4,
    alternative4ImageFile: null,
    alternative4ImagePreviewUrl: question.alternative4Image ?? '',
    removeAlternative4Image: false,
    alternative5: question.alternative5,
    alternative5ImageFile: null,
    alternative5ImagePreviewUrl: question.alternative5Image ?? '',
    removeAlternative5Image: false,
    skillIds: question.skillIds ?? question.skills.map((skill) => skill.id),
  };
}

function buildQuestionFormData(values: QuestionFormValues) {
  const formData = new FormData();
  formData.append('roleId', values.roleId);
  formData.append('boardId', values.boardId);
  formData.append('institutionId', values.institutionId);
  formData.append('educationalLevelId', values.educationalLevelId);
  formData.append('year', values.year);
  formData.append('question', values.question.trim());
  formData.append('correctAlternative', values.correctAlternative);
  formData.append('skillIds', JSON.stringify(values.skillIds));

  if (values.imageFile) {
    formData.append('image', values.imageFile);
  }

  if (values.removeImage && !values.imagePreviewUrl) {
    formData.append('removeImage', 'true');
  }

  ALTERNATIVE_CONFIGS.forEach((config) => {
    formData.append(config.textField, values[config.textField].trim());

    const imageFile = values[config.imageFileField];

    if (imageFile) {
      formData.append(config.apiImageField, imageFile);
    }

    if (values[config.removeImageField] && !values[config.imagePreviewField]) {
      formData.append(config.removeImageField, 'true');
    }
  });

  return formData;
}

function renderHtmlPreview(value: string) {
  return <div className="text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{ __html: value || '—' }} />;
}

function getInitialFilters(): QuestionFilters {
  return {
    roleId: '',
    boardId: '',
    institutionId: '',
    educationalLevelId: '',
    year: '',
    search: '',
  };
}

function QuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: courseIdParam, subjectId: subjectIdParam } = useParams<{ courseId: string; subjectId: string }>();
  const courseId = Number(courseIdParam);
  const subjectId = Number(subjectIdParam);
  const locationState = location.state as QuestionsLocationState | null;
  const [subjectName, setSubjectName] = useState(locationState?.subjectName?.trim() ?? '');
  const [roles, setRoles] = useState<Role[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [educationalLevels, setEducationalLevels] = useState<EducationalLevel[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasPageLoadError, setHasPageLoadError] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>(getInitialFilters);

  const loadPageData = useCallback(async () => {
    if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(subjectId) || subjectId <= 0) {
      setHasPageLoadError(true);
      setIsPageLoading(false);
      return;
    }

    setIsPageLoading(true);
    setHasPageLoadError(false);

    try {
      const [subject, rolesResponse, boardsResponse, institutionsResponse, educationalLevelsResponse, skillsResponse] =
        await Promise.all([
          getSubjectById(courseId, subjectId),
          listRoles({ limit: 100, offset: 0 }),
          listBoards({ limit: 100, offset: 0 }),
          listInstitutions({ limit: 100, offset: 0 }),
          listEducationalLevels({ limit: 100, offset: 0 }),
          listSkills(courseId, subjectId, { limit: 100, offset: 0 }),
        ]);

      setSubjectName(subject.name);
      setRoles(rolesResponse.items);
      setBoards(boardsResponse.items);
      setInstitutions(institutionsResponse.items);
      setEducationalLevels(educationalLevelsResponse.items);
      setSkills(skillsResponse.items);
    } catch {
      setHasPageLoadError(true);
    } finally {
      setIsPageLoading(false);
    }
  }, [courseId, subjectId]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const roleOptions = useMemo(
    () => [{ value: '', label: 'Selecionar...' }, ...roles.map((item) => ({ value: String(item.id), label: item.description }))],
    [roles],
  );
  const boardOptions = useMemo(
    () => [{ value: '', label: 'Selecionar...' }, ...boards.map((item) => ({ value: String(item.id), label: item.description }))],
    [boards],
  );
  const institutionOptions = useMemo(
    () => [{ value: '', label: 'Selecionar...' }, ...institutions.map((item) => ({ value: String(item.id), label: item.description }))],
    [institutions],
  );
  const educationalLevelOptions = useMemo(
    () => [
      { value: '', label: 'Selecionar...' },
      ...educationalLevels.map((item) => ({ value: String(item.id), label: item.description })),
    ],
    [educationalLevels],
  );
  const listQueryFilters = useMemo(
    () => ({
      roleId: filters.roleId ? Number(filters.roleId) : undefined,
      boardId: filters.boardId ? Number(filters.boardId) : undefined,
      institutionId: filters.institutionId ? Number(filters.institutionId) : undefined,
      educationalLevelId: filters.educationalLevelId ? Number(filters.educationalLevelId) : undefined,
      year: filters.year ? Number(filters.year) : undefined,
      search: filters.search.trim() || undefined,
    }),
    [filters],
  );
  const reloadKey = useMemo(() => JSON.stringify(listQueryFilters), [listQueryFilters]);

  if (isPageLoading) {
    return <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel"><div className="flex min-h-0 flex-1 items-center justify-center text-base font-semibold text-slate-600">Carregando...</div></section>;
  }

  if (hasPageLoadError || !subjectName) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-medium text-slate-600">Erro ao carregar dados.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => void loadPageData()} className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">Recarregar</button>
            <button type="button" onClick={() => navigate(`/courses/${courseId}/subjects`)} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Voltar para Disciplinas</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <EntityManagementPage<Question, QuestionFormValues>
      title={subjectName}
      subtitle="Gerenciamento de Questões"
      createButtonLabel="Cadastrar Nova Questão"
      createDialogTitle="Cadastrar Nova Questão"
      editDialogTitle="Editar Questão"
      deleteDialogTitle="Excluir Questão"
      emptyStateMessage="Nenhuma Questão cadastrada."
      dialogPanelClassName="max-w-6xl"
      reloadKey={reloadKey}
      loadEntities={({ limit, offset }) => listQuestions(courseId, subjectId, { limit, offset, ...listQueryFilters })}
      createEntity={(values) => createQuestion(courseId, subjectId, buildQuestionFormData(values), `Erro ao cadastrar uma nova Questão para a disciplina ${subjectName}. Tente novamente.`)}
      updateEntity={(id, values) => updateQuestion(courseId, subjectId, id, buildQuestionFormData(values), `Erro ao editar a Questão da disciplina ${subjectName}. Tente novamente.`)}
      deleteEntity={(id) => deleteQuestion(courseId, subjectId, id)}
      getItemLabel={(item) => `${item.id}`}
      getCreateInitialValues={getCreateInitialValues}
      getEditInitialValues={getEditInitialValues}
      validate={(values) => ({
        roleId: values.roleId ? '' : 'Campo obrigatório.',
        boardId: values.boardId ? '' : 'Campo obrigatório.',
        institutionId: values.institutionId ? '' : 'Campo obrigatório.',
        educationalLevelId: values.educationalLevelId ? '' : 'Campo obrigatório.',
        year: /^\d{4}$/.test(values.year.trim()) ? '' : 'Campo obrigatório.',
        question: stripRichText(values.question) ? '' : 'Campo obrigatório.',
        imageFile: '',
        imagePreviewUrl: '',
        removeImage: '',
        correctAlternative: values.correctAlternative ? '' : 'Campo obrigatório.',
        alternative1: hasAlternativeContent(values.alternative1, values.alternative1ImagePreviewUrl, values.alternative1ImageFile)
          ? ''
          : 'Campo obrigatório.',
        alternative1ImageFile: '',
        alternative1ImagePreviewUrl: '',
        removeAlternative1Image: '',
        alternative2: hasAlternativeContent(values.alternative2, values.alternative2ImagePreviewUrl, values.alternative2ImageFile)
          ? ''
          : 'Campo obrigatório.',
        alternative2ImageFile: '',
        alternative2ImagePreviewUrl: '',
        removeAlternative2Image: '',
        alternative3: hasAlternativeContent(values.alternative3, values.alternative3ImagePreviewUrl, values.alternative3ImageFile)
          ? ''
          : 'Campo obrigatório.',
        alternative3ImageFile: '',
        alternative3ImagePreviewUrl: '',
        removeAlternative3Image: '',
        alternative4: hasAlternativeContent(values.alternative4, values.alternative4ImagePreviewUrl, values.alternative4ImageFile)
          ? ''
          : 'Campo obrigatório.',
        alternative4ImageFile: '',
        alternative4ImagePreviewUrl: '',
        removeAlternative4Image: '',
        alternative5: '',
        alternative5ImageFile: '',
        alternative5ImagePreviewUrl: '',
        removeAlternative5Image: '',
        skillIds: '',
      })}
      getValidationAlertMessage={({ values }) =>
        values.correctAlternative === '5' && !hasAlternativeContent(values.alternative5, values.alternative5ImagePreviewUrl, values.alternative5ImageFile)
          ? 'Erro!\nInsira o conteúdo da Alternativa 5.'
          : null
      }
      renderForm={({ values, errors, setFieldValue }) => (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectInput id="question-role" label="Cargo" value={values.roleId} onChange={(event) => setFieldValue('roleId', event.target.value)} options={roleOptions} error={errors.roleId} />
            <SelectInput id="question-board" label="Banca" value={values.boardId} onChange={(event) => setFieldValue('boardId', event.target.value)} options={boardOptions} error={errors.boardId} />
            <SelectInput id="question-institution" label="Instituição" value={values.institutionId} onChange={(event) => setFieldValue('institutionId', event.target.value)} options={institutionOptions} error={errors.institutionId} />
            <SelectInput id="question-educational-level" label="Nível de Escolaridade" value={values.educationalLevelId} onChange={(event) => setFieldValue('educationalLevelId', event.target.value)} options={educationalLevelOptions} error={errors.educationalLevelId} />
          </div>

          <TextInput id="question-year" label="Ano" type="text" inputMode="numeric" placeholder="Exemplo: 2026" value={values.year} onChange={(event) => setFieldValue('year', event.target.value.replace(/\D/g, '').slice(0, 4))} error={errors.year} />

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Questão</h3>
            <RichTextEditor id="question-content" value={values.question} onChange={(value) => setFieldValue('question', value)} placeholder="Digite a Questão" error={errors.question} variant="question" />
            <ImageUploadField
              label="Imagem"
              file={values.imageFile}
              previewUrl={values.imagePreviewUrl}
              emptyMessage="Nenhuma imagem carregada."
              removeButtonLabel="Remover imagem da questão"
              onChange={(file) => {
                setFieldValue('imageFile', file);
                setFieldValue('imagePreviewUrl', file ? URL.createObjectURL(file) : '');
                setFieldValue('removeImage', false);
              }}
              onRemove={() => {
                setFieldValue('imageFile', null);
                setFieldValue('imagePreviewUrl', '');
                setFieldValue('removeImage', true);
              }}
            />
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Alternativas</h3>
              <p className="mt-1 text-sm text-slate-500">Insira o texto de cada alternativa e selecione a alternativa correta.</p>
              {errors.correctAlternative ? <p className="mt-2 text-sm text-red-500">{errors.correctAlternative}</p> : null}
            </div>

            <div className="space-y-6">
              {ALTERNATIVE_CONFIGS.map((config) => (
                <div key={config.number} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="inline-flex items-center gap-3 text-base font-semibold text-slate-800">
                    <input type="radio" name="correctAlternative" value={config.number} checked={values.correctAlternative === String(config.number)} onChange={(event) => setFieldValue('correctAlternative', event.target.value)} className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500" />
                    Alternativa {config.number}
                  </label>

                  <RichTextEditor
                    id={`question-alternative-${config.number}`}
                    value={values[config.textField]}
                    onChange={(value) => setFieldValue(config.textField, value)}
                    placeholder={`Digite a Alternativa ${config.number}`}
                    error={errors[config.textField]}
                    variant="alternative"
                  />

                  <ImageUploadField
                    label="Imagem"
                    file={values[config.imageFileField]}
                    previewUrl={values[config.imagePreviewField]}
                    emptyMessage="Nenhuma imagem carregada."
                    removeButtonLabel={`Remover imagem da Alternativa ${config.number}`}
                    onChange={(file) => {
                      setFieldValue(config.imageFileField, file);
                      setFieldValue(config.imagePreviewField, file ? URL.createObjectURL(file) : '');
                      setFieldValue(config.removeImageField, false);
                    }}
                    onRemove={() => {
                      setFieldValue(config.imageFileField, null);
                      setFieldValue(config.imagePreviewField, '');
                      setFieldValue(config.removeImageField, true);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Skills</h3>
              <p className="mt-1 text-sm text-slate-500">Selecione as Skills relacionadas à Questão.</p>
            </div>

            {skills.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma Skill cadastrada para a Disciplina.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => {
                  const checked = values.skillIds.includes(skill.id);

                  return (
                    <label key={skill.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setFieldValue(
                            'skillIds',
                            event.target.checked
                              ? [...values.skillIds, skill.id]
                              : values.skillIds.filter((item) => item !== skill.id),
                          )
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{skill.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      deleteConfirmationMessage={(item) => `Tem certeza que deseja excluir a Questão ${stripRichText(item.question).slice(0, 80) || `#${item.id}`}?`}
      successMessages={{ create: 'Questão cadastrada com sucesso.', update: 'Questão editada com sucesso.', delete: 'Questão excluída com sucesso.' }}
      errorMessages={{ create: `Erro ao cadastrar uma nova Questão para a disciplina ${subjectName}. Tente novamente.`, update: `Erro ao editar a Questão da disciplina ${subjectName}. Tente novamente.`, delete: 'Erro ao excluir o item. Tente novamente.' }}
      shouldDisableSaveForAlert={() => true}
      renderContentBeforeList={() => (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 xl:grid-cols-5">
            <SelectInput
              id="questions-filter-role"
              label="Filtrar por Cargo"
              value={filters.roleId}
              onChange={(event) => setFilters((current) => ({ ...current, roleId: event.target.value }))}
              options={roleOptions}
            />
            <SelectInput
              id="questions-filter-board"
              label="Filtrar por Banca"
              value={filters.boardId}
              onChange={(event) => setFilters((current) => ({ ...current, boardId: event.target.value }))}
              options={boardOptions}
            />
            <SelectInput
              id="questions-filter-institution"
              label="Filtrar por Instituição"
              value={filters.institutionId}
              onChange={(event) => setFilters((current) => ({ ...current, institutionId: event.target.value }))}
              options={institutionOptions}
            />
            <SelectInput
              id="questions-filter-educational-level"
              label="Filtrar por Nível de Escolaridade"
              value={filters.educationalLevelId}
              onChange={(event) => setFilters((current) => ({ ...current, educationalLevelId: event.target.value }))}
              options={educationalLevelOptions}
            />
            <TextInput
              id="questions-filter-year"
              label="Filtrar por Ano"
              type="text"
              inputMode="numeric"
              placeholder="Exemplo: 2026"
              value={filters.year}
              onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
            />
          </div>

          <TextInput
            id="questions-filter-search"
            label="Filtrar por Questão ou Alternativa"
            type="text"
            placeholder="Digite o texto da questão ou Alternativa"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </div>
      )}
      renderItemContent={(item) => (
        <div className="grid flex-1 gap-4 xl:grid-cols-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Questão</p>
            <div className="mt-1">{renderHtmlPreview(item.question)}</div>
          </div>
          {ALTERNATIVE_CONFIGS.map((config) => {
            const isCorrect = item[`alternative${config.number}Correct` as keyof Question] === 'Y';
            const content = item[`alternative${config.number}` as keyof Question] as string;

            return (
              <div key={config.number} className={["min-w-0 rounded-2xl p-3", isCorrect ? 'bg-emerald-50' : 'bg-slate-50'].join(' ')}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alternativa {config.number}</p>
                <div className="mt-1">{renderHtmlPreview(content)}</div>
              </div>
            );
          })}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skills</p>
            {item.skills.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">—</p>
            ) : (
              <div className="mt-1 space-y-1">
                {item.skills.map((skill) => <p key={skill.id} className="text-sm text-slate-700">{skill.name}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}

export default QuestionsPage;
