import { useEffect, useState } from 'react';
import EntityManagementPage from '../../components/EntityManagementPage';
import type { Course } from '../../interfaces/course';
import type { Subject } from '../../interfaces/subject';
import SelectInput from '../../components/SelectInput';
import TextInput from '../../components/TextInput';
import { useAuth } from '../../contexts/AuthContext';
import type { User, UserRole } from '../../interfaces/user';
import { listCourses } from '../../services/courses';
import { listSubjects } from '../../services/subjects';
import { createUser, deleteUser, listUsers, updateUser } from '../../services/users';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/;
const DUPLICATE_EMAIL_ERROR_MESSAGE = 'E-mail já cadastrado para outro Usuário.';
const SUBJECT_OPTIONS_PAGE_SIZE = 100;

const roleOptions: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: 'Selecionar…' },
  { value: 'admin', label: 'Administrador' },
  { value: 'professor', label: 'Professor' },
];

interface UserFormValues {
  role: UserRole | '';
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  subjectIds: number[];
}

interface CourseSubjectGroup {
  courseId: number;
  courseName: string;
  subjects: Subject[];
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'student':
      return 'Estudante';
    case 'professor':
      return 'Professor';
    default:
      return role;
  }
}

function getPasswordValidationItems(password: string, confirmPassword: string) {
  return [
    {
      label: 'Pelo menos 8 caracteres',
      isValid: password.length >= 8,
    },
    {
      label: 'Pelo menos 1 letra maiúscula',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'Pelo menos 1 letra minúscula',
      isValid: /[a-z]/.test(password),
    },
    {
      label: 'Pelo menos 1 caracter especial',
      isValid: PASSWORD_SPECIAL_CHARACTER_PATTERN.test(password),
    },
    {
      label: 'Senha e Confirmar Senha devem ser iguais',
      isValid: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
}

async function loadAllCourses() {
  const courses: Course[] = [];
  let offset = 0;

  while (true) {
    const response = await listCourses({
      limit: SUBJECT_OPTIONS_PAGE_SIZE,
      offset,
    });

    courses.push(...response.items);

    if (!response.hasMore) {
      return courses;
    }

    offset += response.limit;
  }
}

async function loadAllSubjectsByCourseId(courseId: number) {
  const subjects: Subject[] = [];
  let offset = 0;

  while (true) {
    const response = await listSubjects(courseId, {
      limit: SUBJECT_OPTIONS_PAGE_SIZE,
      offset,
    });

    subjects.push(...response.items);

    if (!response.hasMore) {
      return subjects;
    }

    offset += response.limit;
  }
}

async function loadCourseSubjectGroups() {
  const courses = await loadAllCourses();
  const groups = await Promise.all(
    courses.map(async (course) => ({
      courseId: course.id,
      courseName: course.name,
      subjects: await loadAllSubjectsByCourseId(course.id),
    })),
  );

  return groups.filter((group) => group.subjects.length > 0);
}

function UsersPage() {
  const { user: authenticatedUser } = useAuth();
  const [courseSubjectGroups, setCourseSubjectGroups] = useState<CourseSubjectGroup[]>([]);
  const [isLoadingSubjectOptions, setIsLoadingSubjectOptions] = useState(true);
  const [hasSubjectOptionsError, setHasSubjectOptionsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSubjectOptions = async () => {
      setIsLoadingSubjectOptions(true);
      setHasSubjectOptionsError(false);

      try {
        const nextGroups = await loadCourseSubjectGroups();

        if (!isMounted) {
          return;
        }

        setCourseSubjectGroups(nextGroups);
      } catch {
        if (!isMounted) {
          return;
        }

        setHasSubjectOptionsError(true);
      } finally {
        if (isMounted) {
          setIsLoadingSubjectOptions(false);
        }
      }
    };

    void loadSubjectOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <EntityManagementPage<User, UserFormValues>
      title="Gerenciamento de Usuários"
      createButtonLabel="Cadastrar Novo Usuário"
      createDialogTitle="Cadastrar Novo Usuário"
      editDialogTitle="Editar Usuário"
      deleteDialogTitle="Excluir Usuário"
      emptyStateMessage="Nenhum Usuário cadastrado."
      loadEntities={listUsers}
      createEntity={(values) =>
        createUser({
          role: values.role as UserRole,
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          subjectIds: values.role === 'professor' ? values.subjectIds : [],
        })
      }
      updateEntity={(id, values) =>
        updateUser(id, {
          role: values.role as UserRole,
          name: values.name.trim(),
          email: values.email.trim(),
          ...(values.password ? { password: values.password } : {}),
          subjectIds: values.role === 'professor' ? values.subjectIds : [],
        })
      }
      deleteEntity={deleteUser}
      getItemLabel={(user) => user.name}
      getCreateInitialValues={() => ({
        role: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        subjectIds: [],
      })}
      getEditInitialValues={(user) => ({
        role: user.role,
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        subjectIds: user.subjectIds ?? [],
      })}
      validate={(values, dialogState) => {
        const isEditMode = dialogState?.type === 'edit';
        const isEditingOwnUser = dialogState?.type === 'edit' && dialogState.item.id === authenticatedUser?.id;
        const shouldValidatePassword = dialogState?.type === 'create' || (isEditingOwnUser && Boolean(values.password));

        return {
          role: values.role ? '' : 'Campo obrigatório.',
          name: values.name.trim() ? '' : 'Campo obrigatório.',
          email: !values.email.trim()
            ? 'Campo obrigatório.'
            : values.email.trim().length > 255 || !EMAIL_PATTERN.test(values.email.trim())
              ? 'E-mail inválido.'
              : '',
          password:
            !isEditMode && !values.password
              ? 'Campo obrigatório.'
              : !shouldValidatePassword
                ? ''
                : values.password.length > 72
                  ? 'A senha deve ter no máximo 72 caracteres.'
                  : getPasswordValidationItems(values.password, values.confirmPassword)
                        .slice(0, 4)
                        .every((item) => item.isValid)
                    ? ''
                    : 'A senha não atende aos requisitos.',
          confirmPassword:
            !isEditMode && !values.confirmPassword
              ? 'Campo obrigatório.'
              : !shouldValidatePassword
                ? ''
                : !values.confirmPassword
                  ? 'Campo obrigatório.'
                  : values.password === values.confirmPassword
                    ? ''
                    : 'As senhas devem ser iguais.',
          subjectIds: '',
        };
      }}
      renderForm={({ values, errors, setFieldValue, dialogState }) => {
        const passwordValidationItems = getPasswordValidationItems(values.password, values.confirmPassword);
        const isEditingOwnUser = dialogState?.type === 'edit' && dialogState.item.id === authenticatedUser?.id;
        const isPasswordDisabled = dialogState?.type === 'edit' && !isEditingOwnUser;
        const isProfessor = values.role === 'professor';
        const selectedSubjectIds = new Set(values.subjectIds);

        return (
          <div className="space-y-4">
            <SelectInput
              id="user-role"
              name="user-role"
              label="Tipo"
              value={values.role}
              onChange={(event) => {
                const nextRole = event.target.value as UserFormValues['role'];

                setFieldValue('role', nextRole);

                if (nextRole !== 'professor') {
                  setFieldValue('subjectIds', []);
                }
              }}
              options={roleOptions}
              error={errors.role}
            />

            <TextInput
              id="user-name"
              name="user-name"
              label="Nome"
              type="text"
              placeholder="Digite o nome"
              value={values.name}
              onChange={(event) => setFieldValue('name', event.target.value)}
              maxLength={255}
              error={errors.name}
            />

            <TextInput
              id="user-email"
              name="user-email"
              label="E-mail"
              type="email"
              placeholder="Digite o e-mail"
              value={values.email}
              onChange={(event) => setFieldValue('email', event.target.value)}
              maxLength={255}
              error={errors.email}
            />

            <TextInput
              id="user-password"
              name="user-password"
              label="Senha"
              type="password"
              placeholder="Digite a senha"
              value={values.password}
              onChange={(event) => setFieldValue('password', event.target.value)}
              maxLength={72}
              error={errors.password}
              disabled={isPasswordDisabled}
            />

          
            <TextInput
              id="user-confirm-password"
              name="user-confirm-password"
              label="Confirmar Senha"
              type="password"
              placeholder="Confirme a senha"
              value={values.confirmPassword}
              onChange={(event) => setFieldValue('confirmPassword', event.target.value)}
              maxLength={72}
              error={errors.confirmPassword}
              disabled={isPasswordDisabled}
            />

            <div className={["rounded-2xl px-4 py-3", isPasswordDisabled ? 'bg-white' : 'bg-slate-50'].join(' ')}>
              <div className="space-y-2">
                {isPasswordDisabled ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                    Somente o usuário logado pode editar a própria senha.
                  </p>
                ) : (
                  passwordValidationItems.map((item) => (
                    <p
                      key={item.label}
                      className={[
                        'text-sm font-medium transition',
                        item.isValid ? 'text-emerald-600' : 'text-slate-500',
                      ].join(' ')}
                    >
                      {item.label}
                    </p>
                  ))
                )}
              </div>
            </div>

            {isProfessor ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">Disciplinas</h3>
                  <p className="text-sm text-slate-600">
                    Informar a quais Disciplinas este Usuário possui permissões de gerenciamento.
                  </p>
                </div>

                {isLoadingSubjectOptions ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
                    Carregando Disciplinas...
                  </div>
                ) : hasSubjectOptionsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    Não foi possível carregar as Disciplinas.
                  </div>
                ) : courseSubjectGroups.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
                    Nenhuma Disciplina cadastrada.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseSubjectGroups.map((group) => (
                      <div key={group.courseId} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.courseName}</h4>

                        <div className="space-y-3">
                          {group.subjects.map((subject) => (
                            <label key={subject.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:border-brand-300 hover:bg-brand-50/40">
                              <input
                                type="checkbox"
                                checked={selectedSubjectIds.has(subject.id)}
                                onChange={(event) => {
                                  const nextSubjectIds = event.target.checked
                                    ? [...values.subjectIds, subject.id]
                                    : values.subjectIds.filter((subjectId) => subjectId !== subject.id);

                                  setFieldValue('subjectIds', nextSubjectIds);
                                }}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />

                              <span className="flex-1 text-sm font-medium text-slate-700">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            
          </div>
        );
      }}
      deleteConfirmationMessage={(user) => `Tem certeza que deseja excluir o item ${user.name}?`}
      successMessages={{
        create: 'Usuário cadastrado com sucesso.',
        update: 'Usuário editado com sucesso.',
        delete: 'Usuário excluído com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar um novo Usuário. Tente novamente.',
        update: 'Erro ao editar o Usuário. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
      isDeleteDisabled={(user) => user.id === authenticatedUser?.id}
      shouldDisableSaveForAlert={(message) => message === DUPLICATE_EMAIL_ERROR_MESSAGE}
      renderItemContent={(user) => (
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nome</p>
            <p className="truncate text-base font-semibold text-slate-800">{user.name}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">E-mail</p>
            <p className="truncate text-base font-semibold text-slate-800">{user.email}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tipo</p>
            <p className="truncate text-base font-semibold text-slate-800">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      )}
    />
  );
}

export default UsersPage;
