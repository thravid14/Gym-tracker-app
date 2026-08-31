import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

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

export function PageHeader({
  title,
  subtitle,
  showBack,
}: {
  title: string
  subtitle?: ReactNode
  /** Renders an in-app "← Back" link above the title, using browser history —
   * for drill-down pages reached from more than one place, so users have an
   * explicit way back that doesn't depend on the OS back gesture. */
  showBack?: boolean
}) {
  const navigate = useNavigate()
  return (
    <header className="mb-4">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="mb-2 text-sm font-medium"
          style={{ color: 'var(--accent)' }}
        >
          ← Back
        </button>
      )}
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
