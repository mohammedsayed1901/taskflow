import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../lib/api-client';
import { applyApiFormErrors } from '../../lib/form-errors';
import { AuthLayout } from './auth-layout';
import { useRegisterMutation } from './auth.hooks';
import { registerSchema, type RegisterInput } from './auth.schemas';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const isBusy = isSubmitting || registerMutation.isPending;

  async function submitRegistration(input: RegisterInput): Promise<void> {
    setFormError(null);

    try {
      await registerMutation.mutateAsync(input);

      navigate('/', {
        replace: true,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setError('email', {
          type: 'server',
          message: error.message,
        });

        return;
      }

      setFormError(
        applyApiFormErrors<RegisterInput>(error, ['name', 'email', 'password'], setError)
      );
    }
  }

  return (
    <AuthLayout
      alternateLabel="Sign in"
      alternatePath="/login"
      alternateText="Already have an account?"
      description="Create your private task workspace in a few seconds."
      title="Create your account"
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitRegistration)(event);
        }}
      >
        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="name">Full name</label>

          <input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            autoFocus
            disabled={isBusy}
            id="name"
            placeholder="Mohammed Sayed"
            type="text"
            {...register('name')}
          />

          {errors.name && (
            <p id="name-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email address</label>

          <input
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            disabled={isBusy}
            id="register-email"
            inputMode="email"
            placeholder="you@example.com"
            type="email"
            {...register('email')}
          />

          {errors.email && (
            <p id="register-email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>

          <input
            aria-describedby={errors.password ? 'register-password-error' : 'password-help'}
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            disabled={isBusy}
            id="register-password"
            placeholder="Create a secure password"
            type="password"
            {...register('password')}
          />

          {errors.password ? (
            <p id="register-password-error" role="alert">
              {errors.password.message}
            </p>
          ) : (
            <p className="form-help" id="password-help">
              At least 8 characters with uppercase, lowercase, and a number.
            </p>
          )}
        </div>

        <button className="auth-submit" disabled={isBusy} type="submit">
          {isBusy ? (
            <>
              <LoaderCircle aria-hidden="true" className="button-spinner" size={19} />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight aria-hidden="true" size={19} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
