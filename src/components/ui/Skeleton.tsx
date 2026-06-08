import { cn } from '../../lib/utils'

type SkeletonProps = {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('skeleton h-4', i === lines - 1 && 'w-2/3', className)}
          />
        ))}
      </div>
    )
  }

  return <div className={cn('skeleton', className)} />
}

export function SessionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="skeleton h-24 w-16 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-3 w-2/3 mt-2" />
        </div>
      </div>
    </div>
  )
}

export function SessionDetailSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="skeleton w-32 h-48 rounded-xl shrink-0 mx-auto sm:mx-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-4 w-1/3 mt-4" />
          <div className="skeleton h-16 w-full mt-4" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-16 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="skeleton h-6 w-28" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="skeleton h-6 w-32" />
            <div className="grid grid-cols-3 gap-3">
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
