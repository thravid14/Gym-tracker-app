import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '', style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'secondary', className = '', children, ...rest }: ButtonProps) {
  const base = 'rounded-lg px-3.5 py-2 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-40'
  const style: Record<string, string> =
    variant === 'primary'
      ? { background: 'var(--accent)', color: 'var(--accent-text)' }
      : variant === 'danger'
        ? { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }
        : variant === 'ghost'
          ? { background: 'transparent', color: 'var(--text)' }
          : { background: 'var(--surface-2)', color: 'var(--text)' }

  return (
    <button className={`${base} ${className}`} style={style} {...rest}>
      {children}
    </button>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <header className="mb-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </header>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-dashed p-6 text-center text-sm"
      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
    >
      {children}
    </div>
  )
}
