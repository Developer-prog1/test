'use client';

import { useState, type InputHTMLAttributes } from 'react';

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  revealLabel: string;
  hideLabel: string;
};

function EyeIcon({ crossed }: { crossed: boolean }) {
  if (crossed) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3.5 3.5l17 17"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.7a2.4 2.4 0 0 0 3.2 3.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M9.9 5.6A10.7 10.7 0 0 1 12 5.4c5.2 0 8.9 4.2 10.1 6.1a1.3 1.3 0 0 1 0 1.4c-.5.8-1.6 2.3-3.3 3.6M6.4 6.9C4.4 8.3 3 10.1 2 11.5a1.3 1.3 0 0 0 0 1.4C3.2 14.8 6.9 19 12 19c1.4 0 2.7-.3 3.9-.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12.2C3.3 14.1 7 18.2 12 18.2s8.7-4.1 10-6c.2-.3.2-.7 0-1C20.7 9.3 17 5.2 12 5.2S3.3 9.3 2 11.2c-.2.3-.2.7 0 1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function PasswordInput({
  revealLabel,
  hideLabel,
  className = '',
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        className={`field pr-12 ${className}`.trim()}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? hideLabel : revealLabel}
        onClick={() => setVisible((value) => !value)}
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--accent)]"
      >
        <EyeIcon crossed={!visible} />
      </button>
    </div>
  );
}
