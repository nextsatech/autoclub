'use client';

import { useEffect, useState } from 'react';
import ClassDetailModal from './components/ClassDetailModal';

const API_URL = 'http://localhost:3000';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC', 
    hour12: true
  });
};

export default function StudentSchedulePage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE SEGURIDAD (CORREGIDOS) ---
  const [studentLicenses, setStudentLicenses] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>(''); // <--- ESTO FALTABA Y CAUSABA EL ERROR

  useEffect(() => {
    // 1. Cargar Usuario y Rol
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Guardamos el rol para usarlo en el filtro
      setUserRole(user.role?.name || ''); 

      // Extraemos licencias si es estudiante
      const licenses = user.student?.license_categories?.map((l: any) => Number(l.id)) || [];
      console.log("Rol:", user.role?.name, "| Licencias:", licenses); // Debug en consola
      setStudentLicenses(licenses);
    }

    // 2. Cargar Semanas
    const fetchWeeks = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/schedules/active`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setWeeks(data);
          if (data.length > 0) setSelectedWeekId(data[0].id);
        }
      } catch (error) {
        console.error("Error cargando semanas", error);
      } finally {
        setLoading(false);
      }
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

  // --- FILTRO INTELIGENTE DE CLASES ---
  const getClassesForDay = (dayIndex: number) => {
    if (!currentWeekData) return [];
    
    const filtered = currentWeekData.classes.filter((cls: any) => {
      // 1. Filtro de Día
      const date = new Date(cls.class_date);
      let day = date.getUTCDay(); 
      day = day === 0 ? 6 : day - 1; 
      if (day !== dayIndex) return false;

      // 2. Protección Anti-Crash (Por si la materia viene null)
      if (!cls.subject) return false;

      // 3. Lógica por Rol
      // Admin ve todo
      if (userRole === 'admin') return true;

      // Estudiante: Filtro Estricto
      if (userRole === 'student') {
        const subjCats = cls.subject.categories || [];

        // CASO A: Materia General (sin categorías), todos la ven
        if (subjCats.length === 0) return true;

        // CASO B: Si el estudiante NO tiene licencias cargadas, NO ve materias específicas
        if (studentLicenses.length === 0) return false;

        // CASO C: Verificar coincidencia exacta de licencias (A1 vs A2)
        const hasAccess = subjCats.some((cat: any) => 
          studentLicenses.includes(Number(cat.id))
        );

        return hasAccess;
      }

      return true; // Otros roles ven todo por defecto
    });

    return filtered.sort((a: any, b: any) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
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
        // Recargar datos para actualizar cupos
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

  // Función para forzar actualización de datos
  const handleFixSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando horario...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-[1800px] mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tu Horario</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Selecciona y reserva tus clases prácticas para esta semana.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-indigo-600">
            <i className="bi bi-calendar4-week text-xl"></i>
          </div>
          <select 
            className="appearance-none bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 block w-full pl-12 p-4 pr-10 font-bold cursor-pointer hover:border-indigo-300 transition-all outline-none shadow-sm"
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
          >
            {weeks.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({new Date(w.start_date).toLocaleDateString('es-CO', {timeZone: 'UTC', day:'numeric', month:'short'})})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
            <i className="bi bi-chevron-down stroke-2"></i>
          </div>
        </div>
      </div>

      {/* --- AVISO DE DEBUG: Si no ves materias, esto te dirá por qué --- */}
      {userRole === 'student' && studentLicenses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <i className="bi bi-exclamation-triangle-fill text-yellow-600 text-xl"></i>
          <div>
            <h4 className="font-bold text-yellow-800">No se detectaron tus licencias</h4>
            <p className="text-sm text-yellow-700 mt-1">
              El sistema no encuentra qué licencias tienes asignadas (A1, B1, etc), por eso no muestra materias específicas.
            </p>
            <button 
              onClick={handleFixSession}
              className="mt-3 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 transition-colors"
            >
              Actualizar mis datos (Requiere re-ingresar)
            </button>
          </div>
        </div>
      )}

      {currentWeekData && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 xl:gap-6">
          {daysOfWeek.map((dayName, index) => {
            const dayClasses = getClassesForDay(index);
            const isToday = new Date().getDay() === (index + 1); 

            return (
              <div key={dayName} className="flex flex-col gap-4 min-h-[500px]">
                
                <div className={`text-center py-3 rounded-xl border ${isToday ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-transparent border-transparent text-gray-400'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">{dayName}</span>
                </div>

                <div className="flex flex-col gap-4 h-full">
                  {dayClasses.length === 0 ? (
                    <div className="flex-1 rounded-3xl bg-gray-50/50 border-2 border-dashed border-gray-100 flex items-center justify-center group hover:bg-gray-50 transition-colors">
                      <span className="text-gray-300 text-xs font-bold group-hover:text-gray-400 transition-colors">Libre</span>
                    </div>
                  ) : (
                    dayClasses.map((cls: any) => {
                      const occupancyPercent = ((cls.max_capacity - cls.available_capacity) / cls.max_capacity) * 100;
                      
                      return (
                        <div 
                          key={cls.id} 
                          onClick={() => setSelectedClass(cls)}
                          className="group relative bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shadow-sm group-hover:bg-indigo-600 transition-colors">
                              {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                            </span>
                            {cls.available_capacity === 0 && (
                               <i className="bi bi-lock-fill text-gray-300"></i>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-gray-900 leading-snug mb-4 line-clamp-2">
                            {cls.subject.name}
                          </h4>

                          <div className="pt-3 border-t border-gray-50">
                             <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-600 font-bold">
                                  {cls.professor.user.full_name.charAt(0)}
                                </div>
                                <span className="text-[11px] text-gray-500 font-medium truncate">
                                  {cls.professor.user.full_name.split(' ')[0]}
                                </span>
                             </div>
                             
                             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${cls.available_capacity === 0 ? 'bg-red-400' : 'bg-green-400 group-hover:bg-indigo-500'} transition-colors`}
                                  style={{ width: `${occupancyPercent > 0 ? occupancyPercent : 10}%` }} 
                                ></div>
                             </div>
                             <div className="flex justify-between mt-1">
                               <span className="text-[9px] text-gray-400 font-bold">Ocupación</span>
                               <span className={`text-[9px] font-bold ${cls.available_capacity === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                 {cls.available_capacity} libres
                               </span>
                             </div>

                             {/* DEBUG VISUAL: Categorías de la materia */}
                             <div className="flex gap-1 mt-2 flex-wrap">
                               {cls.subject.categories?.map((c: any) => (
                                 <span key={c.id} className="text-[9px] bg-gray-100 px-1 rounded text-gray-500 border border-gray-200">
                                   {c.name}
                                 </span>
                               ))}
                             </div>
                          </div>
                        </div>
                      );
                    })
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