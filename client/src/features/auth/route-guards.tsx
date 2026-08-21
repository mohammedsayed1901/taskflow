import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useCurrentUser } from './auth.hooks';

interface RouteGuardProps {
  children: ReactNode;
}

interface SessionErrorProps {
  message: string;
  onRetry: () => void;
}

function SessionLoading() {
  return (
    <main className="session-state">
      <div aria-label="Restoring your session" className="session-spinner" role="status" />

      <p>Restoring your session…</p>
    </main>
  );
}

function SessionError({ message, onRetry }: SessionErrorProps) {
  return (
    <main className="session-state">
      <h1>We couldn’t load TaskFlow</h1>
      <p>{message}</p>

      <button className="primary-button" onClick={onRetry} type="button">
        Try again
      </button>
    </main>
  );
}

export function ProtectedRoute({ children }: RouteGuardProps) {
  const location = useLocation();
  const currentUser = useCurrentUser();

  if (currentUser.isPending) {
    return <SessionLoading />;
  }

  if (currentUser.isError) {
    return (
      <SessionError
        message="Check that the API and MongoDB are running, then retry."
        onRetry={() => {
          void currentUser.refetch();
        }}
      />
    );
  }

  if (!currentUser.data) {
    return (
      <Navigate
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
        to="/login"
      />
    );
  }

  return children;
}

export function GuestOnlyRoute({ children }: RouteGuardProps) {
  const currentUser = useCurrentUser();

  if (currentUser.isPending) {
    return <SessionLoading />;
  }

  if (currentUser.isError) {
    return (
      <SessionError
        message="Check that the API and MongoDB are running, then retry."
        onRetry={() => {
          void currentUser.refetch();
        }}
      />
    );
  }

  if (currentUser.data) {
    return <Navigate replace to="/" />;
  }

  return children;
}
