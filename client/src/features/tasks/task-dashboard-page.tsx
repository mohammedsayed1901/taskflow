import { ListTodo, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCurrentUser, useLogoutMutation } from '../auth/auth.hooks';

export function TaskDashboardPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  const user = currentUser.data;

  if (!user) {
    return null;
  }

  async function handleLogout(): Promise<void> {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login', {
        replace: true,
      });
    } catch {
      // The mutation error is displayed below.
    }
  }

  return (
    <main className="dashboard-foundation">
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

      <section className="dashboard-placeholder">
        <span className="foundation-brand">Authenticated workspace</span>

        <h1>Welcome, {user.name}</h1>

        <p>Your session was restored successfully. Task management comes next.</p>

        {logoutMutation.isError && (
          <p className="error-message" role="alert">
            Sign out failed. Please try again.
          </p>
        )}
      </section>
    </main>
  );
}
