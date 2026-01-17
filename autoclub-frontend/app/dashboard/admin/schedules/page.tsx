'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = 'http://localhost:3000';

interface Schedule {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  _count?: { classes: number }; // Viene del backend para saber si está vacía
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario
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
      console.error(error);
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
        alert('✅ Semana creada exitosamente');
        setForm({ name: '', start_date: '', end_date: '' }); // Limpiar
        loadData(); // Recargar lista
      } else {
        alert('Error al crear semana');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/schedules/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData(); // Refrescar para ver el cambio de color
  };

  const handleDelete = async (id: number) => {
    if(!confirm('¿Estás seguro de eliminar esta semana y toda su configuración?')) return;
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) loadData();
    else alert('No se puede eliminar porque ya tiene clases asociadas.');
  };

  if (loading) return <div className="p-8">Cargando ciclos...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ciclos Semanales</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. FORMULARIO DE CREACIÓN */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4">Nuevo Ciclo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre Etiqueta</label>
              <input 
                type="text" required placeholder="Ej: Semana 3 - Enero"
                className="w-full mt-1 p-2 border rounded-lg"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Desde (Lunes)</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 border rounded-lg text-sm"
                  value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Hasta (Domingo)</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 border rounded-lg text-sm"
                  value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})}
                />
              </div>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800">
              Crear Ciclo
            </button>
          </form>
        </div>

        {/* 2. LISTADO DE SEMANAS */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">Historial de Programación</h2>
          
          {schedules.length === 0 ? (
             <p className="text-gray-400">No hay semanas creadas aún.</p>
          ) : (
            schedules.map(cycle => (
              <div key={cycle.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${cycle.is_active ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
                
                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{cycle.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${cycle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {cycle.is_active ? 'PUBLICADO' : 'BORRADOR'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(cycle.start_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })} al {new Date(cycle.end_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    {cycle._count?.classes || 0} clases programadas
                  </p>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(cycle.id)}
                    className="px-3 py-2 text-sm font-medium bg-white border hover:bg-gray-50 rounded-lg"
                  >
                    {cycle.is_active ? 'Ocultar' : 'Publicar'}
                  </button>
                  
                  {/* ESTE BOTÓN ES CLAVE PARA EL SIGUIENTE PASO */}
                  <Link 
                    href={`/dashboard/admin/schedules/${cycle.id}`}
                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Gestionar Clases
                  </Link>

                  <button 
                    onClick={() => handleDelete(cycle.id)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}