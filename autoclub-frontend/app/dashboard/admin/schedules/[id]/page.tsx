'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'http://localhost:3000';

export default function ScheduleManagePage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Cargar la semana
      const resSchedule = await fetch(`${API_URL}/schedules/${id}`, { headers });
      if (!resSchedule.ok) throw new Error('Error cargando semana');
      const scheduleData = await resSchedule.json();
      setSchedule(scheduleData);

      // 2. Cargar candidatos
      const resCandidates = await fetch(`${API_URL}/schedules/${id}/candidates`, { headers });
      if (resCandidates.ok) {
        setCandidates(await resCandidates.json());
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleAssign = async (classId: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/schedules/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classIds: [classId] }) 
      });
      loadData(); 
    } catch (error) {
      console.error("Error asignando:", error);
    }
  };

  const handleRemove = async (classId: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/schedules/classes/${classId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      console.error("Error removiendo:", error);
    }
  };

  if (loading || !schedule) return <div className="p-8">Cargando gestión...</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in">
      
      {/* HEADER: AHORA CON FECHAS UTC CORRECTAS */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
        <div>
          <Link href="/dashboard/admin/schedules" className="text-sm text-gray-500 hover:underline">← Volver a Ciclos</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Armar: {schedule.name}</h1>
          <p className="text-sm text-gray-500 font-mono">
             {new Date(schedule.start_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })} — {new Date(schedule.end_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold text-xs ${schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {schedule.is_active ? 'PÚBLICO' : 'BORRADOR'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: CLASES DISPONIBLES */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PASO 1</span>
            Clases Disponibles
          </h2>
          <p className="text-xs text-gray-500">
            Estas clases caen en las fechas de esta semana. Haz clic en (+) para agregarlas.
          </p>

          {candidates.length === 0 ? (
            <div className="p-6 bg-gray-50 border border-dashed rounded-xl text-center text-gray-400 text-sm">
              No hay clases sueltas en este rango.
              <br/>
              <Link href="/dashboard/admin/classes" className="text-indigo-600 font-bold hover:underline">Ir a crear clases</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.map((cls: any) => (
                <div key={cls.id} className="bg-white p-3 rounded-lg border border-l-4 border-l-gray-300 shadow-sm flex justify-between items-center group hover:border-l-indigo-500 transition-all">
                  <div>
                    <h4 className="font-bold text-sm">{cls.subject.name}</h4>
                    
                    {/* 👇 AQUÍ ESTÁ EL ARREGLO DE ZONA HORARIA */}
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {new Date(cls.class_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })} • {new Date(cls.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'})}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleAssign(cls.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors"
                    title="Agregar a la semana"
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: CLASES ASIGNADAS */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">PASO 2</span>
            Horario Armado
          </h2>
          <p className="text-xs text-gray-500">
            Estas clases serán visibles para el estudiante.
          </p>

          <div className="bg-gray-50 p-4 rounded-xl min-h-[300px]">
            {schedule.classes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <i className="bi bi-calendar-x text-2xl mb-2"></i>
                <p>La semana está vacía.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedule.classes.map((cls: any) => (
                  <div key={cls.id} className="bg-white p-3 rounded-lg border border-l-4 border-l-green-500 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-green-900">{cls.subject.name}</h4>
                      
                      {/* 👇 AQUÍ TAMBIÉN APLICAMOS EL ARREGLO UTC */}
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        📅 {new Date(cls.class_date).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        ⏰ {new Date(cls.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'})} - {new Date(cls.end_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'})}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Prof: {cls.professor.user.full_name}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(cls.id)}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Quitar de la semana"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}