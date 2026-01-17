'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000'; 

interface User {
  id: number;
  full_name: string;
}

interface Professor {
  id: number;
  user: User;
}

interface Subject {
  id: number;
  name: string;
}

interface ClassSession {
  id: number;
  subject?: Subject; 
  class_date: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  professor?: Professor;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [instructors, setInstructors] = useState<Professor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Estado del Formulario
  const [formData, setFormData] = useState({
    subject_id: '', 
    class_date: '',
    start_time: '',
    end_time: '',
    max_capacity: 5,
    professor_id: ''
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Cargar Clases 
      const resClasses = await fetch(`${API_URL}/classes`, { headers });
      if (resClasses.ok) setClasses(await resClasses.json());

      // 2. Cargar Instructores
      const resProfessors = await fetch(`${API_URL}/professors`, { headers });
      if (resProfessors.ok) setInstructors(await resProfessors.json());

      // 3. Cargar Materias
      const resSubjects = await fetch(`${API_URL}/subjects`, { headers });
      if (resSubjects.ok) {
        setSubjects(await resSubjects.json());
      } else {
        console.warn("No se pudieron cargar las materias. Verifica el endpoint /subjects");
      }

    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // ⚠️ FIX ZONA HORARIA: Construcción manual del ISO String
      // Esto asegura que la hora que escribes es la hora que se guarda (UTC puro)
      const isoStart = `${formData.class_date}T${formData.start_time}:00.000Z`;
      const isoEnd = `${formData.class_date}T${formData.end_time}:00.000Z`;

      const payload = {
        subject_id: Number(formData.subject_id),
        class_date: isoStart, 
        start_time: isoStart,
        end_time: isoEnd,
        max_capacity: Number(formData.max_capacity),
        professor_id: Number(formData.professor_id)
      };

      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear clase');
      }

      alert('✅ Clase creada correctamente');
      
      // Limpiar formulario
      setFormData(prev => ({...prev, subject_id: '', professor_id: ''})); 
      loadData(); 

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta clase permanentemente?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== id));
        alert('Clase eliminada');
      } else {
        const err = await res.json();
        alert(`No se pudo eliminar: ${err.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función auxiliar para obtener nombre del profesor
  const getProfName = (cls: ClassSession) => cls.professor?.user?.full_name || 'Sin Asignar';

  if (loading) return <div className="p-10 text-gray-500">Cargando panel...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Clases</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm"><i className="bi bi-plus-lg"></i></span>
            Programar Clase
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* SELECTOR DE MATERIA */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Materia / Tema</label>
              <select 
                required
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-black focus:border-black outline-none"
                value={formData.subject_id}
                onChange={e => setFormData({...formData, subject_id: e.target.value})}
              >
                <option value="">Seleccionar Materia...</option>
                {subjects.length > 0 ? (
                  subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))
                ) : (
                  <option disabled>No hay materias cargadas</option>
                )}
              </select>
            </div>

            {/* FECHA */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
              <input 
                type="date" 
                required
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black"
                value={formData.class_date}
                onChange={e => setFormData({...formData, class_date: e.target.value})}
              />
            </div>

            {/* HORAS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Inicio</label>
                <input type="time" required className="w-full mt-1 p-2 border rounded-lg text-sm" 
                  value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Fin</label>
                <input type="time" required className="w-full mt-1 p-2 border rounded-lg text-sm" 
                  value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>

            {/* CUPOS Y PROFESOR */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Cupos</label>
                <input 
                  type="number" min="1" required
                  className="w-full mt-1 p-2 border rounded-lg text-sm"
                  value={formData.max_capacity}
                  onChange={e => setFormData({...formData, max_capacity: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Instructor</label>
                <select 
                  required
                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-white"
                  value={formData.professor_id}
                  onChange={e => setFormData({...formData, professor_id: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {instructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.user?.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all mt-2">
              Crear Clase
            </button>
          </form>
        </div>

        {/* COLUMNA 2: LISTADO DE CLASES */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">Clases Programadas</h2>
          
          {classes.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
              <p>No hay clases registradas aún.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    {/* FECHA GRANDE (Con fix UTC) */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      <span className="text-xs font-bold uppercase">
                        {new Date(cls.class_date).toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' })}
                      </span>
                      <span className="text-xl font-black">
                        {new Date(cls.class_date).toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'UTC' })}
                      </span>
                    </div>

                    <div>
                      {/* TITULO DE LA MATERIA */}
                      <h3 className="font-bold text-gray-900 text-lg">
                        {cls.subject?.name || 'Materia Desconocida'}
                      </h3>
                      
                      <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 mt-1">
                        <span className="flex items-center gap-1 font-mono text-xs font-bold">
                          {new Date(cls.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZone: 'UTC'})} - 
                             {new Date(cls.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZone: 'UTC'})}
                        </span>
                        <span className="flex items-center gap-1">
                          {getProfName(cls)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: CUPOS Y ELIMINAR */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                      {cls.available_capacity} cupos
                    </span>
                    
                    <button 
                      onClick={() => handleDelete(cls.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      <i className="bi bi-trash"></i> Eliminar
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