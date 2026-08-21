import { CheckCircle2, ListTodo, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './auth.css';

interface AuthLayoutProps {
  title: string;
  description: string;
  alternateText: string;
  alternateLabel: string;
  alternatePath: string;
  children: ReactNode;
}

export function AuthLayout({
  title,
  description,
  alternateText,
  alternateLabel,
  alternatePath,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-showcase-content">
          <div className="auth-logo auth-logo-light">
            <span className="auth-logo-icon">
              <ListTodo aria-hidden="true" size={25} />
            </span>

            <span>TaskFlow</span>
          </div>

          <div>
            <p className="auth-eyebrow">Make meaningful progress</p>

            <h2>Keep every task clear, prioritized, and moving forward.</h2>

            <p className="auth-showcase-description">
              A focused workspace for planning work and completing what matters.
            </p>
          </div>

          <ul className="auth-benefits">
            <li>
              <CheckCircle2 aria-hidden="true" size={20} />
              Organize work by status and priority
            </li>

            <li>
              <CheckCircle2 aria-hidden="true" size={20} />
              Find tasks quickly with search and filters
            </li>

            <li>
              <ShieldCheck aria-hidden="true" size={20} />
              Private, account-scoped task management
            </li>
          </ul>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo auth-logo">
            <span className="auth-logo-icon">
              <ListTodo aria-hidden="true" size={22} />
            </span>

            <span>TaskFlow</span>
          </div>

          <header className="auth-card-header">
            <h1>{title}</h1>
            <p>{description}</p>
          </header>

          {children}

          <p className="auth-alternate">
            {alternateText} <Link to={alternatePath}>{alternateLabel}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
