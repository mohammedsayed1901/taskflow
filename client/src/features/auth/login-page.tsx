import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { applyApiFormErrors } from '../../lib/form-errors';
import { AuthLayout } from './auth-layout';
import { useLoginMutation } from './auth.hooks';
import { loginSchema, type LoginInput } from './auth.schemas';

function getRedirectPath(state: unknown): string {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('from' in state) ||
    typeof state.from !== 'string' ||
    !state.from.startsWith('/') ||
    state.from.startsWith('//')
  ) {
    return '/';
  }

  return state.from;
}

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isBusy = isSubmitting || loginMutation.isPending;

  async function submitLogin(input: LoginInput): Promise<void> {
    setFormError(null);

    try {
      await loginMutation.mutateAsync(input);

      navigate(getRedirectPath(location.state), {
        replace: true,
      });
    } catch (error: unknown) {
      setFormError(applyApiFormErrors<LoginInput>(error, ['email', 'password'], setError));
    }
  }

  return (
    <AuthLayout
      alternateLabel="Create an account"
      alternatePath="/register"
      alternateText="New to TaskFlow?"
      description="Enter your details to continue to your workspace."
      title="Welcome back"
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitLogin)(event);
        }}
      >
        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="email">Email address</label>

          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            autoFocus
            disabled={isBusy}
            id="email"
            inputMode="email"
            placeholder="you@example.com"
            type="email"
            {...register('email')}
          />

          {errors.email && (
            <p id="email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>

          <input
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            disabled={isBusy}
            id="password"
            placeholder="Enter your password"
            type="password"
            {...register('password')}
          />

          {errors.password && (
            <p id="password-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <button className="auth-submit" disabled={isBusy} type="submit">
          {isBusy ? (
            <>
              <LoaderCircle aria-hidden="true" className="button-spinner" size={19} />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden="true" size={19} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
