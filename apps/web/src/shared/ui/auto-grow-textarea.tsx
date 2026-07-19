'use client';

import {
  useEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react';

type AutoGrowTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'rows'
> & {
  /** Initial visible lines before content grows. */
  minRows?: number;
};

export function AutoGrowTextarea({
  minRows = 3,
  value,
  className = '',
  onChange,
  ...rest
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      {...rest}
      ref={ref}
      rows={minRows}
      value={value}
      onChange={onChange}
      className={`field resize-none overflow-hidden ${className}`.trim()}
    />
  );
}
