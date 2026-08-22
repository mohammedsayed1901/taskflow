import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  LogOut,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { Task, TaskFilters, TaskPriority, TaskSort, TaskStatus } from '../../types/api';
import { TaskBoard } from './components/task-board';
import { TASK_PRIORITIES, TASK_SORTS, TASK_STATUSES } from '../../types/api';
import { useCurrentUser, useLogoutMutation } from '../auth/auth.hooks';
import { DeleteTaskDialog } from './delete-task-dialog';
import { TaskFormDialog } from './task-form-dialog';
import { useMoveTaskMutation, useTasks } from './task.hooks';
import './tasks.css';

const TASKS_PER_PAGE = 12;

function isTaskStatus(value: string | null): value is TaskStatus {
  return value !== null && TASK_STATUSES.some((status) => status === value);
}

function isTaskPriority(value: string | null): value is TaskPriority {
  return value !== null && TASK_PRIORITIES.some((priority) => priority === value);
}

function isTaskSort(value: string | null): value is TaskSort {
  return value !== null && TASK_SORTS.some((sort) => sort === value);
}

function parsePage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseFilters(searchParams: URLSearchParams): TaskFilters {
  const search = searchParams.get('search')?.trim() ?? '';

  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const sort = searchParams.get('sort');

  return {
    page: parsePage(searchParams.get('page')),
    limit: TASKS_PER_PAGE,
    sort: isTaskSort(sort) ? sort : 'dueDate',
    ...(search ? { search } : {}),
    ...(isTaskStatus(status) ? { status } : {}),
    ...(isTaskPriority(priority) ? { priority } : {}),
  };
}

function DashboardSkeleton() {
  return (
    <div aria-label="Loading tasks" className="task-grid" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="task-card task-card-skeleton" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

interface TaskSearchFormProps {
  initialValue: string;
  onSearch: (value: string) => void;
}

function TaskSearchForm({ initialValue, onSearch }: TaskSearchFormProps) {
  const [searchDraft, setSearchDraft] = useState(initialValue);

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSearch(searchDraft.trim());
  }

  return (
    <form className="task-search" onSubmit={submitSearch}>
      <Search aria-hidden="true" size={19} />

      <input
        aria-label="Search tasks by title"
        onChange={(event) => {
          setSearchDraft(event.target.value);
        }}
        placeholder="Search tasks by title"
        type="search"
        value={searchDraft}
      />

      {searchDraft && (
        <button
          aria-label="Clear search"
          className="icon-button"
          onClick={() => {
            setSearchDraft('');
            onSearch('');
          }}
          type="button"
        >
          <X aria-hidden="true" size={17} />
        </button>
      )}

      <button className="search-submit" type="submit">
        Search
      </button>
    </form>
  );
}

export function TaskDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const moveTaskMutation = useMoveTaskMutation(filters);

  const [taskFormOpen, setTaskFormOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const tasksQuery = useTasks(filters);
  const user = currentUser.data;

  if (!user) {
    return null;
  }

  function updateFilter(key: 'search' | 'status' | 'priority' | 'sort', value: string): void {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }

      next.delete('page');

      return next;
    });
  }

  function goToPage(page: number): void {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (page <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }

      return next;
    });
  }

  function clearFilters(): void {
    setSearchParams({});
  }

  function openCreateDialog(): void {
    setEditingTask(null);
    setTaskFormOpen(true);
  }

  function openEditDialog(task: Task): void {
    setEditingTask(task);
    setTaskFormOpen(true);
  }

  function closeTaskForm(): void {
    setTaskFormOpen(false);
    setEditingTask(null);
  }

  function handleMoveTask(taskId: string, status: TaskStatus): void {
    moveTaskMutation.mutate({
      taskId,
      status,
    });
  }

  async function handleLogout(): Promise<void> {
    try {
      await logoutMutation.mutateAsync();

      navigate('/login', {
        replace: true,
      });
    } catch {
      // The error state is rendered below.
    }
  }

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.priority);

  const taskData = tasksQuery.data;

  return (
    <main className="task-dashboard">
      <header className="dashboard-header">
        <div className="brand-lockup">
          <span className="brand-icon">
            <ListTodo aria-hidden="true" size={22} />
          </span>

          <span>TaskFlow</span>
        </div>

        <div className="dashboard-user">
          <span>
            Signed in as <strong>{user.name}</strong>
          </span>

          <button
            className="secondary-button"
            disabled={logoutMutation.isPending}
            onClick={() => {
              void handleLogout();
            }}
            type="button"
          >
            <LogOut aria-hidden="true" size={17} />
            {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <div className="task-dashboard-content">
        <section className="task-page-heading">
          <div>
            <p className="task-eyebrow">Personal workspace</p>

            <h1>My tasks</h1>

            <p>Plan your work, track progress, and keep priorities visible.</p>
          </div>

          <div className="task-heading-actions">
            {taskData && (
              <div className="task-total">
                <strong>{taskData.pagination.total}</strong>

                <span>{taskData.pagination.total === 1 ? 'task' : 'tasks'}</span>
              </div>
            )}

            <button
              className="primary-button new-task-button"
              onClick={openCreateDialog}
              type="button"
            >
              <Plus aria-hidden="true" size={18} />
              New task
            </button>
          </div>
        </section>

        <section aria-label="Search and filter tasks" className="task-toolbar">
          <TaskSearchForm
            key={searchParams.toString()}
            initialValue={filters.search ?? ''}
            onSearch={(value) => {
              updateFilter('search', value);
            }}
          />

          <div className="task-filters">
            <SlidersHorizontal aria-hidden="true" className="filter-icon" size={19} />

            <select
              aria-label="Filter by status"
              onChange={(event) => {
                updateFilter('status', event.target.value);
              }}
              value={filters.status ?? ''}
            >
              <option value="">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              aria-label="Filter by priority"
              onChange={(event) => {
                updateFilter('priority', event.target.value);
              }}
              value={filters.priority ?? ''}
            >
              <option value="">All priorities</option>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            <select
              aria-label="Sort tasks"
              onChange={(event) => {
                updateFilter('sort', event.target.value);
              }}
              value={filters.sort}
            >
              <option value="dueDate">Due date: earliest</option>
              <option value="-dueDate">Due date: latest</option>
              <option value="-createdAt">Recently created</option>
              <option value="createdAt">Oldest created</option>
            </select>

            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters} type="button">
                Clear filters
              </button>
            )}
          </div>
        </section>

        {tasksQuery.isFetching && !tasksQuery.isPending && (
          <p className="background-refresh" role="status">
            Refreshing tasks…
          </p>
        )}

        {tasksQuery.isPending && <DashboardSkeleton />}

        {tasksQuery.isError && (
          <section className="task-state">
            <span className="task-state-icon error">
              <AlertTriangle aria-hidden="true" size={28} />
            </span>

            <h2>We couldn’t load your tasks</h2>

            <p>Check your connection and try the request again.</p>

            <button
              className="primary-button"
              onClick={() => {
                void tasksQuery.refetch();
              }}
              type="button"
            >
              <RotateCw aria-hidden="true" size={17} />
              Try again
            </button>
          </section>
        )}

        {taskData && taskData.tasks.length === 0 && taskData.pagination.total === 0 && (
          <section className="task-state">
            <span className="task-state-icon">
              <ListTodo aria-hidden="true" size={30} />
            </span>

            <h2>{hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}</h2>

            <p>
              {hasActiveFilters
                ? 'Try changing or clearing your search and filters.'
                : 'Create your first task to start organizing your work.'}
            </p>

            {hasActiveFilters ? (
              <button className="secondary-button" onClick={clearFilters} type="button">
                Clear filters
              </button>
            ) : (
              <button className="primary-button" onClick={openCreateDialog} type="button">
                <Plus aria-hidden="true" size={18} />
                Create your first task
              </button>
            )}
          </section>
        )}

        {taskData && taskData.tasks.length === 0 && taskData.pagination.total > 0 && (
          <section className="task-state">
            <h2>This page has no tasks</h2>
            <p>Return to the first available page.</p>

            <button
              className="secondary-button"
              onClick={() => {
                goToPage(1);
              }}
              type="button"
            >
              Go to page 1
            </button>
          </section>
        )}

        {taskData && taskData.tasks.length > 0 && (
          <>
            <TaskBoard
              tasks={taskData.tasks}
              disabled={moveTaskMutation.isPending}
              onMove={handleMoveTask}
              onEdit={openEditDialog}
              onDelete={setDeletingTask}
            />

            {taskData.pagination.pages > 1 && (
              <nav aria-label="Task pagination" className="task-pagination">
                <button
                  aria-label="Previous page"
                  disabled={filters.page <= 1}
                  onClick={() => {
                    goToPage(filters.page - 1);
                  }}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={18} />
                  Previous
                </button>

                <span>
                  Page {filters.page} of {taskData.pagination.pages}
                </span>

                <button
                  aria-label="Next page"
                  disabled={filters.page >= taskData.pagination.pages}
                  onClick={() => {
                    goToPage(filters.page + 1);
                  }}
                  type="button"
                >
                  Next
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </nav>
            )}
          </>
        )}

        {logoutMutation.isError && (
          <p className="dashboard-error" role="alert">
            Sign out failed. Please try again.
          </p>
        )}

        {moveTaskMutation.isError ? (
          <div className="feedback feedback-error" role="alert">
            We could not update the task status. Please try again.
          </div>
        ) : null}
      </div>

      <TaskFormDialog onClose={closeTaskForm} open={taskFormOpen} task={editingTask} />

      <DeleteTaskDialog
        onClose={() => {
          setDeletingTask(null);
        }}
        task={deletingTask}
      />
    </main>
  );
}
