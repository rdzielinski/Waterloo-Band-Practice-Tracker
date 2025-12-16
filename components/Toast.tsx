import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const ICONS = {
  success: <CheckCircle className="w-6 h-6 text-green-400" />,
  error: <AlertTriangle className="w-6 h-6 text-red-400" />,
  info: <Info className="w-6 h-6 text-blue-400" />,
};

const BG_COLORS = {
  success: 'bg-maroon/80 border-green-600',
  error: 'bg-maroon/80 border-red-600',
  info: 'bg-maroon/80 border-blue-600',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div 
      className={`max-w-sm w-full rounded-lg shadow-2xl p-4 border backdrop-blur-sm flex items-start space-x-3 animate-toast-in ${BG_COLORS[toast.type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 text-sm text-gray-200">
        <p>{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)} 
        className="text-gray-400 hover:text-white transition-colors rounded-full p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-full max-w-sm space-y-3"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};