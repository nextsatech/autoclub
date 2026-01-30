'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de logs
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50/50 px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        
        <h2 className="text-3xl font-black text-zinc-900">¡Algo salió mal!</h2>
        <p className="text-zinc-500">
          Tuvimos un problema técnico procesando tu solicitud.
        </p>
        
        <button
          onClick={() => reset()}
          className="mt-6 px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-xl"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}