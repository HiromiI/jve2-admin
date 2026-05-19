import EntityManagementPage from '../../components/EntityManagementPage';
import TextInput from '../../components/TextInput';
import type { Institution } from '../../interfaces/institution';
import {
  createInstitution,
  deleteInstitution,
  listInstitutions,
  updateInstitution,
} from '../../services/institutions';

interface InstitutionFormValues {
  description: string;
}

function InstitutionsPage() {
  return (
    <EntityManagementPage<Institution, InstitutionFormValues>
      title="Gerenciamento de Instituições"
      createButtonLabel="Cadastrar Nova Instituição"
      createDialogTitle="Cadastrar Nova Instituição"
      editDialogTitle="Editar Instituição"
      deleteDialogTitle="Excluir Instituição"
      emptyStateMessage="Nenhuma Instituição cadastrada."
      loadEntities={listInstitutions}
      createEntity={createInstitution}
      updateEntity={updateInstitution}
      deleteEntity={deleteInstitution}
      getItemLabel={(institution) => institution.description}
      getCreateInitialValues={() => ({ description: '' })}
      getEditInitialValues={(institution) => ({ description: institution.description })}
      validate={(values) => ({
        description: values.description.trim() ? '' : 'Campo obrigatório',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <TextInput
          id="institution-description"
          name="institution-description"
          label="Descrição"
          placeholder="Digite a descrição"
          value={values.description}
          onChange={(event) => setFieldValue('description', event.target.value)}
          maxLength={255}
          error={errors.description}
        />
      )}
      deleteConfirmationMessage={(institution) => `Tem certeza que deseja excluir o item ${institution.description}?`}
      successMessages={{
        create: 'Instituição cadastrada com sucesso.',
        update: 'Instituição editada com sucesso.',
        delete: 'Instituição excluída com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar uma nova Instituição. Tente novamente.',
        update: 'Erro ao editar a Instituição. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
    />
  );
}

export default InstitutionsPage;
