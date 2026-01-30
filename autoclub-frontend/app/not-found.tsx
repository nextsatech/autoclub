'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="text-center space-y-6 max-w-lg">
        {/* Icono animado o imagen */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border border-blue-50">
             <i className="bi bi-cone-striped text-6xl text-orange-500"></i>
          </div>
        </div>

        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
          404 - Ruta Desconocida
        </h1>
        <p className="text-zinc-500 text-lg">
          Parece que te has salido del camino. Esta página no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-100 transition-colors"
          >
            Volver Atrás
          </button>
          <Link 
            href="/dashboard" 
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            Ir al Panel Principal
          </Link>
        </div>
      </div>
    </div>
  );
}