import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AlertToast from './AlertToast';
import Modal from './Modal';
import SuccessToast from './SuccessToast';

const DEFAULT_PAGE_SIZE = 8;
const LIST_ITEM_GAP_PX = 16;
const TOAST_DURATION_MS = 3000;

type DialogState<TItem> =
  | {
      type: 'create';
    }
  | {
      type: 'edit';
      item: TItem;
    }
  | {
      type: 'delete';
      item: TItem;
    }
  | null;

type FieldErrors<TFormValues extends object> = Partial<Record<Extract<keyof TFormValues, string>, string>>;

interface EntityManagementPageProps<TItem extends { id: number }, TFormValues extends object> {
  title: string;
  subtitle?: string;
  createButtonLabel: string;
  createDialogTitle: string;
  editDialogTitle: string;
  deleteDialogTitle: string;
  emptyStateMessage: string;
  loadEntities: (params: { limit: number; offset: number }) => Promise<{ items: TItem[]; total: number }>;
  createEntity: (payload: TFormValues) => Promise<unknown>;
  updateEntity: (id: number, payload: TFormValues) => Promise<unknown>;
  deleteEntity: (id: number) => Promise<unknown>;
  getItemLabel: (item: TItem) => string;
  getCreateInitialValues: () => TFormValues;
  getEditInitialValues: (item: TItem) => TFormValues;
  validate: (values: TFormValues, dialogState: DialogState<TItem>) => FieldErrors<TFormValues>;
  renderForm: (props: {
    values: TFormValues;
    errors: FieldErrors<TFormValues>;
    setFieldValue: <K extends Extract<keyof TFormValues, string>>(field: K, value: TFormValues[K]) => void;
    dialogState: DialogState<TItem>;
  }) => ReactNode;
  deleteConfirmationMessage: (item: TItem) => string;
  successMessages: {
    create: string;
    update: string;
    delete: string;
  };
  errorMessages: {
    create: string;
    update: string;
    delete: string;
  };
  renderItemContent?: (item: TItem) => ReactNode;
  renderListHeader?: () => ReactNode;
  renderContentBeforeList?: () => ReactNode;
  renderItemActions?: (item: TItem) => ReactNode;
  isCreateDisabled?: boolean;
  isEditDisabled?: (item: TItem) => boolean;
  isDeleteDisabled?: (item: TItem) => boolean;
  shouldDisableSaveForAlert?: (message: string) => boolean;
  getValidationAlertMessage?: (params: {
    values: TFormValues;
    errors: FieldErrors<TFormValues>;
    dialogState: DialogState<TItem>;
  }) => string | null;
  dialogPanelClassName?: string;
  reloadKey?: string;
}

function EntityManagementPage<TItem extends { id: number }, TFormValues extends object>({
  title,
  subtitle,
  createButtonLabel,
  createDialogTitle,
  editDialogTitle,
  deleteDialogTitle,
  emptyStateMessage,
  loadEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  getItemLabel,
  getCreateInitialValues,
  getEditInitialValues,
  validate,
  renderForm,
  deleteConfirmationMessage,
  successMessages,
  errorMessages,
  renderItemContent,
  renderListHeader,
  renderContentBeforeList,
  renderItemActions,
  isCreateDisabled,
  isEditDisabled,
  isDeleteDisabled,
  shouldDisableSaveForAlert,
  getValidationAlertMessage,
  dialogPanelClassName,
  reloadKey,
}: EntityManagementPageProps<TItem, TFormValues>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState<TItem>>(null);
  const [formValues, setFormValues] = useState<TFormValues>(() => getCreateInitialValues());
  const [formErrors, setFormErrors] = useState<FieldErrors<TFormValues>>({});
  const [dialogAlertMessage, setDialogAlertMessage] = useState('');
  const [isSaveDisabledByAlert, setIsSaveDisabledByAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listViewportRef = useRef<HTMLDivElement | null>(null);
  const firstListItemRef = useRef<HTMLElement | null>(null);
  const dialogAlertRef = useRef<HTMLDivElement | null>(null);
  const previousReloadKeyRef = useRef(reloadKey);

  const dialogTitle = useMemo(() => {
    if (dialogState?.type === 'create') {
      return createDialogTitle;
    }

    if (dialogState?.type === 'edit') {
      return editDialogTitle;
    }

    return deleteDialogTitle;
  }, [createDialogTitle, deleteDialogTitle, dialogState, editDialogTitle]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [pageSize, totalItems]);

  const loadItems = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setHasLoadError(false);

      try {
        const data = await loadEntities({
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });
        setItems(data.items);
        setTotalItems(data.total);
      } catch {
        setHasLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [loadEntities, pageSize],
  );

  useEffect(() => {
    void loadItems(currentPage);
  }, [currentPage, loadItems]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (reloadKey === previousReloadKeyRef.current) {
      return;
    }

    previousReloadKeyRef.current = reloadKey;

    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    void loadItems(1);
  }, [currentPage, loadItems, reloadKey]);

  useEffect(() => {
    const updatePageSize = () => {
      const listViewport = listViewportRef.current;
      const firstListItem = firstListItemRef.current;

      if (!listViewport || !firstListItem) {
        return;
      }

      const availableHeight = listViewport.getBoundingClientRect().height;
      const itemHeight = firstListItem.getBoundingClientRect().height;

      if (availableHeight <= 0 || itemHeight <= 0) {
        return;
      }

      const nextPageSize = Math.max(
        1,
        Math.floor((availableHeight + LIST_ITEM_GAP_PX) / (itemHeight + LIST_ITEM_GAP_PX)),
      );

      setPageSize((currentSize) => (currentSize === nextPageSize ? currentSize : nextPageSize));
    };

    const animationFrameId = window.requestAnimationFrame(updatePageSize);

    window.addEventListener('resize', updatePageSize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePageSize);
    };
  }, [items]);

  useEffect(() => {
    if (!dialogAlertMessage || (dialogState?.type !== 'create' && dialogState?.type !== 'edit')) {
      return;
    }

    dialogAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [dialogAlertMessage, dialogState]);

  const resetDialogData = useCallback(() => {
    setDialogState(null);
    setFormValues(getCreateInitialValues());
    setFormErrors({});
    setDialogAlertMessage('');
    setIsSaveDisabledByAlert(false);
  }, [getCreateInitialValues]);

  const dismissDialogAlert = useCallback(() => {
    setDialogAlertMessage('');
    setIsSaveDisabledByAlert(false);
  }, []);

  const showDialogAlert = useCallback(
    (message: string) => {
      setDialogAlertMessage(message);
      setIsSaveDisabledByAlert(shouldDisableSaveForAlert?.(message) ?? false);
    },
    [shouldDisableSaveForAlert],
  );

  const closeDialog = (force = false) => {
    if (isSubmitting && !force) {
      return;
    }

    resetDialogData();
  };

  const showSuccessToast = (message: string) =>
    new Promise<void>((resolve) => {
      const toastId = `${message}-${Date.now()}`;

      toast.custom(<SuccessToast title={message} durationMs={TOAST_DURATION_MS} />, {
        id: toastId,
        duration: TOAST_DURATION_MS,
      });

      window.setTimeout(() => {
        toast.dismiss(toastId);
        resolve();
      }, TOAST_DURATION_MS);
    });

  const openCreateDialog = () => {
    if (isCreateDisabled) {
      return;
    }

    setDialogState({ type: 'create' });
    setFormValues(getCreateInitialValues());
    setFormErrors({});
    setDialogAlertMessage('');
    setIsSaveDisabledByAlert(false);
  };

  const openEditDialog = (item: TItem) => {
    if (isEditDisabled?.(item)) {
      return;
    }

    setDialogState({ type: 'edit', item });
    setFormValues(getEditInitialValues(item));
    setFormErrors({});
    setDialogAlertMessage('');
    setIsSaveDisabledByAlert(false);
  };

  const openDeleteDialog = (item: TItem) => {
    if (isDeleteDisabled?.(item)) {
      return;
    }

    setDialogState({ type: 'delete', item });
    setFormValues(getCreateInitialValues());
    setFormErrors({});
    setDialogAlertMessage('');
    setIsSaveDisabledByAlert(false);
  };

  const setFieldValue = <K extends Extract<keyof TFormValues, string>>(field: K, value: TFormValues[K]) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
  };

  const resolveErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallbackMessage;
  };

  const handleSave = async () => {
    const nextErrors = validate(formValues, dialogState);
    const validationAlertMessage = getValidationAlertMessage?.({
      values: formValues,
      errors: nextErrors,
      dialogState: dialogState as DialogState<TItem>,
    });

    if (Object.values(nextErrors).some((value) => Boolean(value)) || validationAlertMessage) {
      setFormErrors(nextErrors);

      if (validationAlertMessage) {
        showDialogAlert(validationAlertMessage);
      }

      return;
    }

    setIsSubmitting(true);
    setDialogAlertMessage('');

    try {
      if (dialogState?.type === 'edit') {
        await updateEntity(dialogState.item.id, formValues);
        await showSuccessToast(successMessages.update);
      } else {
        await createEntity(formValues);
        await showSuccessToast(successMessages.create);
      }

      closeDialog(true);
      await loadItems(currentPage);
    } catch (error) {
      showDialogAlert(
        resolveErrorMessage(error, dialogState?.type === 'edit' ? errorMessages.update : errorMessages.create),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (dialogState?.type !== 'delete') {
      return;
    }

    setIsSubmitting(true);
    setDialogAlertMessage('');

    try {
      await deleteEntity(dialogState.item.id);
      closeDialog(true);
      await showSuccessToast(successMessages.delete);
      if (items.length === 1 && currentPage > 1) {
        setCurrentPage((previousPage) => previousPage - 1);
      } else {
        await loadItems(currentPage);
      }
    } catch (error) {
      showDialogAlert(resolveErrorMessage(error, errorMessages.delete));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasLoadError) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-medium text-slate-600">Erro ao carregar dados.</p>
          <button
            type="button"
            onClick={() => void loadItems(currentPage)}
            className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Recarregar
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-8 shadow-panel">
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
              {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={openCreateDialog}
              disabled={isCreateDisabled}
              className={[
                'rounded-2xl px-5 py-3 text-sm font-semibold text-white transition',
                isCreateDisabled
                  ? 'cursor-not-allowed bg-brand-300 opacity-60'
                  : 'bg-brand-600 hover:bg-brand-700',
              ].join(' ')}
            >
              {createButtonLabel}
            </button>
          </div>

          {renderContentBeforeList ? renderContentBeforeList() : null}

          {isLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center text-base font-semibold text-slate-600">
              Carregando...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
              {emptyStateMessage}
            </div>
          ) : (
            <>
              <div ref={listViewportRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="space-y-4">
                  {renderListHeader ? renderListHeader() : null}

                  {items.map((item, index) => (
                    <article
                      key={item.id}
                      ref={index === 0 ? firstListItemRef : null}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {(() => {
                        const editDisabled = isEditDisabled?.(item) ?? false;
                        const deleteDisabled = isDeleteDisabled?.(item) ?? false;

                        return (
                          <>
                      {renderItemContent ? (
                        renderItemContent(item)
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{getItemLabel(item)}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {renderItemActions ? renderItemActions(item) : null}

                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          disabled={editDisabled}
                          className={[
                            'rounded-2xl px-4 py-2 text-sm font-semibold text-white transition',
                            editDisabled
                              ? 'cursor-not-allowed bg-amber-300 opacity-60'
                              : 'bg-amber-500 hover:bg-amber-600',
                          ].join(' ')}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteDialog(item)}
                          disabled={deleteDisabled}
                          className={[
                            'rounded-2xl px-4 py-2 text-sm font-semibold text-white transition',
                            deleteDisabled
                              ? 'cursor-not-allowed bg-red-300 opacity-60'
                              : 'bg-red-600 hover:bg-red-700',
                          ].join(' ')}
                        >
                          Excluir
                        </button>
                      </div>
                          </>
                        );
                      })()}
                    </article>
                  ))}
                </div>
              </div>

              <div className="flex justify-center border-t border-slate-200 pt-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.max(1, previousPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <p className="text-sm font-medium text-slate-600">
                    Página {currentPage} de {totalPages}
                  </p>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1))}
                    disabled={currentPage === totalPages || totalItems === 0}
                    aria-label="Próxima página"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {dialogState?.type === 'create' || dialogState?.type === 'edit' ? (
        <Modal title={dialogTitle} panelClassName={dialogPanelClassName}>
          <div className="space-y-6">
            {renderForm({
              values: formValues,
              errors: formErrors,
              setFieldValue,
              dialogState,
            })}

            {dialogAlertMessage ? (
              <div ref={dialogAlertRef}>
                <AlertToast title={dialogAlertMessage} onClose={dismissDialogAlert} />
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => closeDialog()}
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSubmitting || isSaveDisabledByAlert}
                className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {dialogState?.type === 'delete' ? (
        <Modal title={dialogTitle} panelClassName={dialogPanelClassName}>
          <div className="space-y-6">
            <p className="text-base text-slate-700">{deleteConfirmationMessage(dialogState.item)}</p>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => closeDialog()}
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Sim, excluir
              </button>
            </div>

            {dialogAlertMessage ? (
              <AlertToast title={dialogAlertMessage} onClose={dismissDialogAlert} />
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default EntityManagementPage;
