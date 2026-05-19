import EntityManagementPage from '../../components/EntityManagementPage';
import TextInput from '../../components/TextInput';
import type { Board } from '../../interfaces/board';
import { createBoard, deleteBoard, listBoards, updateBoard } from '../../services/boards';

interface BoardFormValues {
  description: string;
}

function BoardsPage() {
  return (
    <EntityManagementPage<Board, BoardFormValues>
      title="Gerenciamento de Bancas"
      createButtonLabel="Cadastrar Nova Banca"
      createDialogTitle="Cadastrar Nova Banca"
      editDialogTitle="Editar Banca"
      deleteDialogTitle="Excluir Banca"
      emptyStateMessage="Nenhuma Banca cadastrada."
      loadEntities={listBoards}
      createEntity={createBoard}
      updateEntity={updateBoard}
      deleteEntity={deleteBoard}
      getItemLabel={(board) => board.description}
      getCreateInitialValues={() => ({ description: '' })}
      getEditInitialValues={(board) => ({ description: board.description })}
      validate={(values) => ({
        description: values.description.trim() ? '' : 'Campo obrigatório',
      })}
      renderForm={({ values, errors, setFieldValue }) => (
        <TextInput
          id="board-description"
          name="board-description"
          label="Descrição"
          placeholder="Digite a descrição"
          value={values.description}
          onChange={(event) => setFieldValue('description', event.target.value)}
          maxLength={255}
          error={errors.description}
        />
      )}
      deleteConfirmationMessage={(board) => `Tem certeza que deseja excluir o item ${board.description}?`}
      successMessages={{
        create: 'Banca cadastrada com sucesso.',
        update: 'Banca editada com sucesso.',
        delete: 'Banca excluída com sucesso.',
      }}
      errorMessages={{
        create: 'Erro ao cadastrar uma nova Banca. Tente novamente.',
        update: 'Erro ao editar a Banca. Tente novamente.',
        delete: 'Erro ao excluir o item. Tente novamente.',
      }}
    />
  );
}

export default BoardsPage;
