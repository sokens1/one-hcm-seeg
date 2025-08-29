import React from 'react'
import { Toast } from './toast'
import { useToast } from '@/hooks/useToast'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        >
          <div>
            {toast.title && (
              <div className="font-semibold mb-1">{toast.title}</div>
            )}
            <div className="text-sm">{toast.message}</div>
          </div>
        </Toast>
      ))}
    </div>
  )
}












