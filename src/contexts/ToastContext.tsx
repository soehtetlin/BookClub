import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  type: ToastType
  exiting?: boolean
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      )
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl px-5 py-3 text-sm font-medium shadow-xl border backdrop-blur-lg max-w-xs ${
              t.exiting ? 'animate-toast-out' : 'animate-toast-in'
            } ${
              t.type === 'success'
                ? 'bg-sage-light/90 text-sage-dark border-sage/20'
                : t.type === 'error'
                  ? 'bg-rose-light/90 text-rose border-rose/20'
                  : 'bg-gold-light/90 text-ink border-gold/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
              </span>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
