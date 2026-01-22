'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

interface Schedule {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  _count?: { classes: number }; 
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSchedules(await res.json());
    } catch (error) {
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/schedules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showToast('Semana creada exitosamente', 'success');
        setForm({ name: '', start_date: '', end_date: '' }); 
        loadData(); 
      } else {
        showToast('Error al crear semana', 'error');
      }
    } catch (error) {
      showToast('Error de red', 'error');
    }
  };

  const toggleStatus = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/schedules/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData(); 
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/schedules/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        loadData();
        showToast('Ciclo eliminado correctamente', 'success');
      } else {
        showToast('No se puede eliminar: Tiene clases asociadas.', 'error');
      }
    } catch (error) {
      showToast('Error al intentar eliminar', 'error');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando ciclos...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ciclos Semanales</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4">Nuevo Ciclo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Etiqueta</label>
              <input 
                type="text" required placeholder="Ej: Semana 3 - Enero"
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Desde (Lunes)</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black"
                  value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Hasta (Domingo)</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black"
                  value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})}
                />
              </div>
            </div>

            <button className="w-full bg-black text-white py-2.5 rounded-lg font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
              Crear Ciclo
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">Historial de Programación</h2>
          
          {schedules.length === 0 ? (
             <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
               No hay ciclos creados. Empieza por crear uno.
             </div>
          ) : (
            schedules.map(cycle => (
              <div key={cycle.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${cycle.is_active ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-80 hover:opacity-100'}`}>
                
                <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{cycle.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-black tracking-widest uppercase ${cycle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {cycle.is_active ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    📅 {new Date(cycle.start_date).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short' })} al {new Date(cycle.end_date).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-indigo-600 font-bold mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded">
                    {cycle._count?.classes || 0} clases programadas
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                  <button 
                    onClick={() => toggleStatus(cycle.id)}
                    className="px-3 py-2 text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
                  >
                    {cycle.is_active ? 'Ocultar' : 'Publicar'}
                  </button>
                  
                  <Link 
                    href={`/dashboard/admin/schedules/${cycle.id}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    Gestionar Clases
                  </Link>

                  <button 
                    onClick={() => confirmDelete(cycle.id)}
                    className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar ciclo"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Ciclo?"
        message="Esta acción eliminará el ciclo semanal. Solo es posible si no tiene clases activas."
        type="danger"
      />
    </div>
  );
}