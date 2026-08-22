import { AlertCircle, CalendarDays, Pencil, Trash2 } from 'lucide-react';

import type { Task } from '../../types/api';

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
} as const;

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function isTaskOverdue(task: Task): boolean {
  if (task.status === 'done') {
    return false;
  }

  const now = new Date();

  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return new Date(task.dueDate).getTime() < today;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  return (
    <article className="task-card">
      <div className="task-card-badges">
        <span className="task-status" data-status={task.status}>
          {statusLabels[task.status]}
        </span>

        <span className="task-priority" data-priority={task.priority}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      <div className="task-card-content">
        <h2>{task.title}</h2>
        <p>{task.description}</p>
      </div>

      <footer className="task-card-footer">
        <div className="task-due" data-overdue={overdue}>
          {overdue ? (
            <AlertCircle aria-hidden="true" size={17} />
          ) : (
            <CalendarDays aria-hidden="true" size={17} />
          )}

          <span>{overdue ? 'Overdue · ' : 'Due '}</span>

          <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
        </div>

        <div className="task-card-actions">
          <button
            aria-label={`Edit ${task.title}`}
            className="task-action-button"
            onClick={() => {
              onEdit(task);
            }}
            title="Edit task"
            type="button"
          >
            <Pencil aria-hidden="true" size={16} />
          </button>

          <button
            aria-label={`Delete ${task.title}`}
            className="task-action-button delete"
            onClick={() => {
              onDelete(task);
            }}
            title="Delete task"
            type="button"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </div>
      </footer>
    </article>
  );
}
