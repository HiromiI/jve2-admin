import EntityManagementPage from '../../components/EntityManagementPage';
import TextInput from '../../components/TextInput';
import type { EducationalLevel } from '../../interfaces/educationalLevel';
import {
  createEducationalLevel,
  deleteEducationalLevel,
  listEducationalLevels,
  updateEducationalLevel,
} from '../../services/educationalLevels';

interface EducationalLevelFormValues {
  description: string;
}

function EducationalLevelsPage() {
  return (
    <EntityManagementPage<EducationalLevel, EducationalLevelFormValues>
      title="Gerenciamento de Níveis de Escolaridade"
      createButtonLabel="Cadastrar Novo Nível de Escolaridade"
      createDialogTitle="Cadastrar Novo Nível de Escolaridade"
      editDialogTitle="Editar Nível de Escolaridade"
      deleteDialogTitle="Excluir Nível de Escolaridade"
      emptyStateMessage="Nenhum Nível de Escolaridade cadastrado."
      loadEntities={listEducationalLevels}
      createEntity={createEducationalLevel}
      updateEntity={updateEducationalLevel}
      deleteEntity={deleteEducationalLevel}
      getItemLabel={(educationalLevel) => educationalLevel.description}
      getCreateInitialValues={() => ({ description: '' })}
      getEditInitialValues={(educationalLevel) => ({ description: educationalLevel.description })}
      validate={(values) => ({
        description: values.description.trim() ? '' : 'Campo obrigatório',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <TextInput
          id="educational-level-description"
          name="educational-level-description"
          label="Descrição"
          placeholder="Digite a descrição"
          value={values.description}
          onChange={(event) => setFieldValue('description', event.target.value)}
          maxLength={255}
          error={errors.description}
        />
      )}
      deleteConfirmationMessage={(educationalLevel) =>
        `Tem certeza que deseja excluir o item ${educationalLevel.description}?`
      }
      successMessages={{
        create: 'Nível de Escolaridade cadastrado com sucesso.',
        update: 'Nível de Escolaridade editado com sucesso.',
        delete: 'Nível de Escolaridade excluído com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar um novo Nível de Escolaridade. Tente novamente.',
        update: 'Erro ao editar o Nível de Escolaridade. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
    />
  );
}

export default EducationalLevelsPage;
