'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// --- TIPOS ---
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- COMPONENTE VISUAL (DISEÑO) ---
const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  // Configuración de estilos según el tipo
  const config = {
    success: { border: 'bg-emerald-500', icon: 'bi-check-circle-fill text-emerald-500', title: 'Éxito' },
    error:   { border: 'bg-red-500',   icon: 'bi-x-circle-fill text-red-500',     title: 'Error' },
    info:    { border: 'bg-blue-500',  icon: 'bi-info-circle-fill text-blue-500',  title: 'Información' },
  };

  const style = config[toast.type];

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 flex relative mb-3 animate-in slide-in-from-top-2 fade-in duration-300">
      
      {/* Línea de color lateral */}
      <div className={`w-1.5 ${style.border}`}></div>
      
      <div className="p-4 flex items-start gap-3 w-full">
        <i className={`bi ${style.icon} text-lg mt-0.5`}></i>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 leading-none mb-1">{style.title}</p>
          <p className="text-sm text-gray-500">{toast.message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <i className="bi bi-x text-lg"></i>
        </button>
      </div>
    </div>
  );
};

// --- PROVEEDOR (LÓGICA) ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-eliminar a los 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* CONTENEDOR FLOTANTE (Posición: Arriba Derecha) */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end w-full max-w-sm pointer-events-none px-4 md:px-0">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- HOOK PARA USARLO EN CUALQUIER LADO ---
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
}