import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { applyApiFormErrors } from '../../lib/form-errors';
import type { Task } from '../../types/api';
import { useCreateTaskMutation, useUpdateTaskMutation } from './task.hooks';
import { taskFormSchema, type TaskFormInput } from './task.schemas';

interface TaskFormDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

function getDefaultValues(task: Task | null): TaskFormInput {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.slice(0, 10),
    };
  }

  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  };
}

export function TaskFormDialog({ open, task, onClose }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(task),
  });

  const mutationPending = createMutation.isPending || updateMutation.isPending;

  const isBusy = isSubmitting || mutationPending;
  const isEditing = task !== null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(getDefaultValues(task));
  }, [open, reset, task]);

  function requestClose(): void {
    if (!isBusy) {
      setFormError(null);
      onClose();
    }
  }

  async function submitTask(input: TaskFormInput): Promise<void> {
    setFormError(null);

    try {
      if (task) {
        await updateMutation.mutateAsync({
          taskId: task.id,
          input,
        });
      } else {
        await createMutation.mutateAsync(input);
      }

      onClose();
    } catch (error: unknown) {
      setFormError(
        applyApiFormErrors<TaskFormInput>(
          error,
          ['title', 'description', 'status', 'priority', 'dueDate'],
          setError
        )
      );
    }
  }

  return (
    <dialog
      aria-labelledby="task-dialog-title"
      className="task-dialog"
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
      <div className="task-dialog-panel">
        <header className="task-dialog-header">
          <div>
            <p className="task-dialog-eyebrow">{isEditing ? 'Update task' : 'New task'}</p>

            <h2 id="task-dialog-title">{isEditing ? 'Edit task' : 'Create a task'}</h2>
          </div>

          <button
            aria-label="Close task dialog"
            className="task-dialog-close"
            disabled={isBusy}
            onClick={requestClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form
          className="task-form"
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submitTask)(event);
          }}
        >
          <div className="task-dialog-body">
            {formError && (
              <div className="task-form-alert" role="alert">
                {formError}
              </div>
            )}

            <div className="task-form-field">
              <label htmlFor="task-title">Title</label>

              <input
                aria-describedby={errors.title ? 'task-title-error' : undefined}
                aria-invalid={Boolean(errors.title)}
                autoFocus
                disabled={isBusy}
                id="task-title"
                maxLength={100}
                placeholder="What needs to be done?"
                type="text"
                {...register('title')}
              />

              {errors.title && (
                <p id="task-title-error" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="task-form-field">
              <label htmlFor="task-description">Description</label>

              <textarea
                aria-describedby={errors.description ? 'task-description-error' : undefined}
                aria-invalid={Boolean(errors.description)}
                disabled={isBusy}
                id="task-description"
                maxLength={1_000}
                placeholder="Add useful context and details"
                rows={5}
                {...register('description')}
              />

              {errors.description && (
                <p id="task-description-error" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="task-form-row">
              <div className="task-form-field">
                <label htmlFor="task-status">Status</label>

                <select
                  aria-invalid={Boolean(errors.status)}
                  disabled={isBusy}
                  id="task-status"
                  {...register('status')}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                {errors.status && <p role="alert">{errors.status.message}</p>}
              </div>

              <div className="task-form-field">
                <label htmlFor="task-priority">Priority</label>

                <select
                  aria-invalid={Boolean(errors.priority)}
                  disabled={isBusy}
                  id="task-priority"
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                {errors.priority && <p role="alert">{errors.priority.message}</p>}
              </div>
            </div>

            <div className="task-form-field">
              <label htmlFor="task-due-date">Due date</label>

              <input
                aria-describedby={errors.dueDate ? 'task-due-date-error' : undefined}
                aria-invalid={Boolean(errors.dueDate)}
                disabled={isBusy}
                id="task-due-date"
                type="date"
                {...register('dueDate')}
              />

              {errors.dueDate && (
                <p id="task-due-date-error" role="alert">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <footer className="task-dialog-footer">
            <button
              className="secondary-button"
              disabled={isBusy}
              onClick={requestClose}
              type="button"
            >
              Cancel
            </button>

            <button className="primary-button" disabled={isBusy} type="submit">
              {isBusy && (
                <LoaderCircle aria-hidden="true" className="task-button-spinner" size={18} />
              )}

              {isBusy ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
