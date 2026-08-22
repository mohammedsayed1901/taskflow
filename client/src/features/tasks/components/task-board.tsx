import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { GripVertical } from 'lucide-react';
import { TASK_STATUSES, type Task, type TaskStatus } from '../../../types/api';
import { TaskCard } from '../task-card';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

interface TaskBoardProps {
  tasks: Task[];
  disabled?: boolean;
  onMove: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface DraggableTaskProps {
  task: Task;
  disabled: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  disabled: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && TASK_STATUSES.some((status) => status === value);
}

function DraggableTask({ task, disabled, onEdit, onDelete }: DraggableTaskProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: task.id,
    type: 'task',
    disabled,
    data: {
      status: task.status,
    },
  });

  return (
    <div ref={ref} className="kanban-task" data-dragging={isDragging}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            ref={handleRef}
            type="button"
            className="task-drag-handle"
            aria-label={`Move ${task.title}`}
            title={`Move ${task.title}`}
            disabled={disabled}
          >
            <GripVertical aria-hidden="true" size={18} />
          </button>
        }
      />
    </div>
  );
}

function KanbanColumn({ status, tasks, disabled, onEdit, onDelete }: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    accept: 'task',
  });

  return (
    <section
      ref={ref}
      className="kanban-column"
      data-status={status}
      data-drop-target={isDropTarget}
      aria-labelledby={`column-${status}`}
    >
      <header className="kanban-column-header">
        <h2 id={`column-${status}`}>{STATUS_LABELS[status]}</h2>
        <span aria-label={`${tasks.length} tasks`}>{tasks.length}</span>
      </header>

      <div className="kanban-column-list">
        {tasks.length === 0 ? (
          <p className="kanban-column-empty">Drop a task here</p>
        ) : (
          tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              disabled={disabled}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function TaskBoard({ tasks, disabled = false, onMove, onEdit, onDelete }: TaskBoardProps) {
  const groupedTasks: Record<TaskStatus, Task[]> = {
    todo: [],
    'in-progress': [],
    done: [],
  };

  for (const task of tasks) {
    groupedTasks[task.status].push(task);
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const sourceId = event.operation.source?.id;
        const targetId = event.operation.target?.id;

        if (typeof sourceId !== 'string' || !isTaskStatus(targetId)) {
          return;
        }

        const task = tasks.find((candidate) => candidate.id === sourceId);

        if (!task || task.status === targetId) {
          return;
        }

        onMove(task.id, targetId);
      }}
    >
      <p className="kanban-help">
        Drag tasks between columns to change their status. The board shows tasks from the current
        filtered page.
      </p>

      <div className="kanban-board">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            disabled={disabled}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
