import { useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  variant: 'default' | 'success' | 'error' | 'warning'
  title?: string
  message: string
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, title?: string) => {
    return addToast({ variant: 'success', message, title })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    return addToast({ variant: 'error', message, title })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    return addToast({ variant: 'warning', message, title })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    return addToast({ variant: 'default', message, title })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}












