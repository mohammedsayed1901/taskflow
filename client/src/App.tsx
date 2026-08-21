import { Navigate, Route, Routes } from 'react-router-dom';

import { GuestOnlyRoute, ProtectedRoute } from './features/auth/route-guards';
import { TaskDashboardPage } from './features/tasks/task-dashboard-page';
import { LoginPage } from './features/auth/login-page';
import { RegisterPage } from './features/auth/register-page';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TaskDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        }
      />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
