import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '../../lib/api-client';
import type { Task } from '../../types/api';
import { useDeleteTaskMutation } from './task.hooks';

interface DeleteTaskDialogProps {
  task: Task | null;
  onClose: () => void;
}

export function DeleteTaskDialog({ task, onClose }: DeleteTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteTaskMutation();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    setErrorMessage(null);

    if (task && !dialog.open) {
      dialog.showModal();
    }

    if (!task && dialog.open) {
      dialog.close();
    }
  }, [task]);

  function requestClose(): void {
    if (!deleteMutation.isPending) {
      onClose();
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!task) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteMutation.mutateAsync(task.id);
      onClose();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Unable to delete the task. Please try again.'
      );
    }
  }

  return (
    <dialog
      aria-labelledby="delete-dialog-title"
      className="task-dialog delete-task-dialog"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
      ref={dialogRef}
    >
      {task && (
        <div className="task-dialog-panel">
          <header className="task-dialog-header">
            <span className="delete-dialog-icon">
              <Trash2 aria-hidden="true" size={24} />
            </span>

            <button
              aria-label="Close delete dialog"
              className="task-dialog-close"
              disabled={deleteMutation.isPending}
              onClick={requestClose}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          <div className="delete-dialog-content">
            <h2 id="delete-dialog-title">Delete this task?</h2>

            <p>“{task.title}” will be permanently deleted. This action cannot be undone.</p>

            {errorMessage && (
              <div className="task-form-alert" role="alert">
                {errorMessage}
              </div>
            )}
          </div>

          <footer className="task-dialog-footer">
            <button
              className="secondary-button"
              disabled={deleteMutation.isPending}
              onClick={requestClose}
              type="button"
            >
              Keep task
            </button>

            <button
              className="danger-button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                void confirmDelete();
              }}
              type="button"
            >
              {deleteMutation.isPending && (
                <LoaderCircle aria-hidden="true" className="task-button-spinner" size={18} />
              )}

              {deleteMutation.isPending ? 'Deleting…' : 'Delete task'}
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
