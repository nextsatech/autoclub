'use client';

import { useEffect, useState } from 'react';

// Tipos de datos
interface User {
  id: number;
  full_name: string;
  email: string;
}

interface ClassSession {
  id: number;
  title: string;
  class_date: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  professor?: {
    user?: {
      full_name: string;
    }
  };
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]); // Para el select
  const [loading, setLoading] = useState(true);
  
  // Estado del Formulario
  const [formData, setFormData] = useState({
    title: '',
    class_date: '',
    start_time: '',
    end_time: '',
    max_capacity: 5,
    professor_id: ''
  });

  // 1. Cargar Datos Iniciales (Clases existentes y Usuarios para el select)
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Cargar Clases
        const resClasses = await fetch('http://localhost:3000/classes', { headers });
        if (resClasses.ok) setClasses(await resClasses.json());

        // Cargar Usuarios (Para buscar instructores)
        // tener un endpoint solo para instructores. 
        // Por ahora traeremos todos los usuarios.
        const resUsers = await fetch('http://localhost:3000/professors', { headers });
        if (resUsers.ok) setInstructors(await resUsers.json());

      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Manejar creación de clase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // Convertir fechas al formato ISO-8601 que espera el backend
      // Truco: Combinamos fecha + hora para crear objetos Date válidos
      const startDateTime = new Date(`${formData.class_date}T${formData.start_time}:00.000Z`);
      const endDateTime = new Date(`${formData.class_date}T${formData.end_time}:00.000Z`);

      const payload = {
        title: formData.title,
        class_date: new Date(formData.class_date).toISOString(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        max_capacity: Number(formData.max_capacity),
        professor_id: Number(formData.professor_id)
      };

      const res = await fetch('http://localhost:3000/classes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear la clase');
      }

      alert('✅ Clase creada correctamente');
      window.location.reload(); 

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loading) return <div className="p-8">Cargando panel de gestión...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Gestión de Clases</h1>
        <p className="text-zinc-500 text-sm mt-1">Programa los horarios de práctica para la semana.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Creación */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-fit">
          <h3 className="font-bold text-lg text-zinc-800 mb-4 flex items-center gap-2">
            <i className="bi bi-plus-circle-fill text-indigo-600"></i> Nueva Clase
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Título de la Sesión</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ej: Práctica de Parqueo B1"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Fecha</label>
                <input 
                  type="date" 
                  required
                  className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  value={formData.class_date}
                  onChange={e => setFormData({...formData, class_date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Inicio</label>
                <input 
                  type="time" 
                  required
                  className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Fin</label>
                <input 
                  type="time" 
                  required
                  className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  value={formData.end_time}
                  onChange={e => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Cupos</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  value={formData.max_capacity}
                  onChange={e => setFormData({...formData, max_capacity: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Instructor</label>
                <select 
                  required
                  className="w-full mt-1 p-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-500 bg-white"
                  value={formData.professor_id}
                  onChange={e => setFormData({...formData, professor_id: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {instructors.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors shadow-lg shadow-zinc-200 mt-2">
              Crear Horario
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Lista de Clases Creadas */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-zinc-800 flex items-center gap-2">
            <i className="bi bi-calendar-week text-indigo-600"></i> Horarios Programados
          </h3>

          {classes.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-12 text-center text-zinc-400">
              <i className="bi bi-inbox-fill text-4xl mb-2"></i>
              <p>No hay clases creadas aún.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                      {new Date(cls.class_date).getDate()}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-800">{cls.title}</h4>
                      <div className="text-xs text-zinc-500 flex gap-3 mt-1">
                        <span className="flex items-center gap-1"><i className="bi bi-clock"></i> {new Date(cls.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1"><i className="bi bi-person"></i> {cls.professor?.user?.full_name || 'Sin asignar'}</span>
                        <span className="flex items-center gap-1"><i className="bi bi-people"></i> {cls.available_capacity} cupos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}