import EntityManagementPage from '../../components/EntityManagementPage';
import TextInput from '../../components/TextInput';
import type { Role } from '../../interfaces/role';
import { createRole, deleteRole, listRoles, updateRole } from '../../services/roles';

interface RoleFormValues {
  description: string;
}

function RolesPage() {
  return (
    <EntityManagementPage<Role, RoleFormValues>
      title="Gerenciamento de Cargos"
      createButtonLabel="Cadastrar Novo Cargo"
      createDialogTitle="Cadastrar Novo Cargo"
      editDialogTitle="Editar Cargo"
      deleteDialogTitle="Excluir Cargo"
      emptyStateMessage="Nenhum Cargo cadastrado."
      loadEntities={listRoles}
      createEntity={createRole}
      updateEntity={updateRole}
      deleteEntity={deleteRole}
      getItemLabel={(role) => role.description}
      getCreateInitialValues={() => ({ description: '' })}
      getEditInitialValues={(role) => ({ description: role.description })}
      validate={(values) => ({
        description: values.description.trim() ? '' : 'Campo obrigatório',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <TextInput
          id="role-description"
          name="role-description"
          label="Descrição"
          placeholder="Digite a descrição"
          value={values.description}
          onChange={(event) => setFieldValue('description', event.target.value)}
          maxLength={255}
          error={errors.description}
        />
      )}
      deleteConfirmationMessage={(role) => `Tem certeza que deseja excluir o item ${role.description}?`}
      successMessages={{
        create: 'Cargo cadastrado com sucesso.',
        update: 'Cargo editado com sucesso.',
        delete: 'Cargo excluído com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar um novo Cargo. Tente novamente.',
        update: 'Erro ao editar o Cargo. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
    />
  );
}

export default RolesPage;
