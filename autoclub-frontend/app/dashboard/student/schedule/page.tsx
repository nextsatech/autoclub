'use client';

import { useEffect, useState } from 'react';
import ClassDetailModal from './components/ClassDetailModal';

const API_URL = 'http://localhost:3000';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: true
  });
};

export default function StudentSchedulePage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentLicenses, setStudentLicenses] = useState<number[]>([]);

  useEffect(() => {
    // 1. Cargar licencias del usuario
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Extraemos los IDs asegurando que sean números
      const licenses = user.student?.license_categories?.map((l: any) => Number(l.id)) || [];
      console.log("Licencias del estudiante:", licenses); // Debug
      setStudentLicenses(licenses);
    }

    const fetchWeeks = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/schedules/active`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setWeeks(data);
        if (data.length > 0) setSelectedWeekId(data[0].id);
      }
      setLoading(false);
    };
    fetchWeeks();
  }, []);

  useEffect(() => {
    if (!selectedWeekId) return;
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/schedules/${selectedWeekId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCurrentWeekData(await res.json());
    };
    fetchClasses();
  }, [selectedWeekId]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getClassesForDay = (dayIndex: number) => {
    if (!currentWeekData) return [];
    
    // FILTRADO ESTRICTO
    const filtered = currentWeekData.classes.filter((cls: any) => {
      // 1. Filtro de Día
      const date = new Date(cls.class_date);
      let day = date.getUTCDay(); 
      day = day === 0 ? 6 : day - 1; 
      if (day !== dayIndex) return false;

      // 2. Filtro de Licencia (Solo si hay licencias definidas)
      if (studentLicenses.length > 0) {
        // Verificar si la materia tiene categorías definidas desde el backend
        if (!cls.subject.categories || cls.subject.categories.length === 0) {
          // Si la materia es "General" (sin categorías), la mostramos.
          return true;
        }

        // Verificar coincidencia
        const hasAccess = cls.subject.categories.some((cat: any) => 
          studentLicenses.includes(Number(cat.id))
        );

        return hasAccess;
      }

      return true; // Si no hay licencias (ej. Admin), muestra todo
    });

    return filtered.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const handleReserve = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('token');
    
    if(!confirm(`¿Confirmar reserva para: ${selectedClass.subject.name}?`)) return;

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class_id: selectedClass.id })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡Reserva exitosa!');
        setSelectedClass(null);
        // Recargar
        const currentWeek = selectedWeekId;
        setSelectedWeekId(''); 
        setTimeout(() => setSelectedWeekId(currentWeek), 10); 
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando horario...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Tu Horario</h1>
          <p className="text-gray-500 mt-2 text-lg">Filtrando clases para tus licencias activas.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <select 
            className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-2xl block w-full p-4 font-bold outline-none"
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
          >
            {weeks.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({new Date(w.start_date).toLocaleDateString('es-CO', {timeZone: 'UTC'})})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentWeekData && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {daysOfWeek.map((dayName, index) => {
            const dayClasses = getClassesForDay(index);
            const isToday = new Date().getDay() === (index + 1); 

            return (
              <div key={dayName} className="flex flex-col gap-4 min-h-[500px]">
                <div className={`text-center py-2 rounded-xl border ${isToday ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-transparent text-gray-400'}`}>
                  <span className="text-xs font-black uppercase">{dayName}</span>
                </div>

                <div className="flex flex-col gap-3 h-full">
                  {dayClasses.length === 0 ? (
                    <div className="flex-1 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 text-xs font-bold">Sin clases</span>
                    </div>
                  ) : (
                    dayClasses.map((cls: any) => (
                      <div 
                        key={cls.id} 
                        onClick={() => setSelectedClass(cls)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {formatTime(cls.start_time)}
                          </span>
                          <span className={`text-[10px] font-bold ${cls.available_capacity === 0 ? 'text-red-500' : 'text-green-500'}`}>
                             {cls.available_capacity} cupos
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 mb-1 line-clamp-2">{cls.subject.name}</h4>
                        
                        {/* Indicadores de Licencia (Visual) */}
                        <div className="flex gap-1 mt-2">
                           {cls.subject.categories?.map((c: any) => (
                             <span key={c.id} className="text-[9px] bg-gray-100 px-1 rounded text-gray-500">{c.name}</span>
                           ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClass && (
        <ClassDetailModal 
          cls={selectedClass} 
          onClose={() => setSelectedClass(null)} 
          onReserve={handleReserve}
        />
      )}
    </div>
  );
}