import { cn } from '../../lib/utils'
import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-border bg-card px-4 py-2.5 text-ink min-h-[100px] resize-y',
          'placeholder:text-ink-muted/60',
          'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'transition-shadow',
          error && 'border-red-400 focus:ring-red-200',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
