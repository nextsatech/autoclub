'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Estado para controlar si el menú móvil está abierto
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Pasamos el estado y la función de cerrar al Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* md:ml-64 empuja el contenido a la derecha SOLO en escritorio */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Pasamos la función para ABRIR el menú al Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Ajustamos el padding: p-4 en móvil, p-8 en escritorio */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}