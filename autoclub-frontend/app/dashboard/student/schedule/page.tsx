'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

// --- UTILIDADES ---
const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC', 
    hour12: true
  }); // Ej: 08:00 AM
};

// --- COMPONENTE MODAL "HIGH-END" ---
const ClassDetailModal = ({ cls, onClose, onReserve }: { cls: any, onClose: () => void, onReserve: () => void }) => {
  if (!cls) return null;

  // Cálculos de estado
  const occupancy = ((cls.max_capacity - cls.available_capacity) / cls.max_capacity) * 100;
  const isFull = cls.available_capacity === 0;

  // Formateadores rápidos
  const dateStr = new Date(cls.class_date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const startStr = formatTime(cls.start_time);
  const endStr = formatTime(cls.end_time);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-gray-900/50 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* TARJETA PRINCIPAL */}
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. CABECERA LIMPIA (Sticky) */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                <i className="bi bi-calendar4"></i> {dateStr}
              </span>
              {isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                  Agotado
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {cls.subject.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* 2. CUERPO: GRID DE INFORMACIÓN */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            {/* Box: HORA */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group">
              <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                <i className="bi bi-clock-history text-xl"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Horario</span>
              </div>
              <p className="text-gray-900 font-bold text-lg font-mono">
                {startStr} <span className="text-gray-300">/</span> {endStr}
              </p>
            </div>

            {/* Box: INSTRUCTOR */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group">
              <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                <i className="bi bi-person-badge text-xl"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Instructor</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {cls.professor.user.full_name.charAt(0)}
                 </div>
                 <p className="text-gray-900 font-bold text-sm truncate">
                    {cls.professor.user.full_name}
                 </p>
              </div>
            </div>

            {/* Box: ESTADO (Ancho completo en móvil) */}
            <div className="col-span-1 md:col-span-2 p-5 rounded-2xl bg-gray-50 border border-gray-100">
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-gray-400">
                     <i className="bi bi-people text-xl"></i>
                     <span className="text-xs font-bold uppercase tracking-wider">Disponibilidad</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {cls.available_capacity} cupos restantes
                  </span>
               </div>
               
               {/* Barra de Progreso Segmentada */}
               <div className="flex gap-1 h-2">
                  {[...Array(10)].map((_, i) => {
                     // Lógica visual para barra segmentada
                     const threshold = (i + 1) * 10;
                     const isFilled = occupancy >= threshold;
                     return (
                        <div 
                           key={i} 
                           className={`flex-1 rounded-full transition-all duration-500 ${isFilled ? 'bg-gray-300' : 'bg-indigo-500'}`}
                        ></div>
                     );
                  })}
               </div>
               <p className="text-[10px] text-gray-400 mt-2 text-right">
                  La barra muestra el porcentaje de ocupación actual.
               </p>
            </div>

          </div>

          {/* Información Adicional Minimalista */}
          <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-900 text-sm">
             <i className="bi bi-info-circle-fill mt-0.5 text-indigo-500"></i>
             <p className="leading-relaxed text-xs font-medium opacity-80">
                Recuerda llegar 15 minutos antes. Para cancelar esta reserva debes hacerlo con al menos 24 horas de antelación desde tu panel de usuario.
             </p>
          </div>

        </div>

        {/* 3. FOOTER (Acción) */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={onReserve}
            disabled={isFull}
            className={`w-full py-4 rounded-xl font-bold text-base tracking-wide shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
              ${isFull 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'}`}
          >
            {isFull ? (
              <span>Lista de Espera (Lleno)</span>
            ) : (
              <> 
                <span>Confirmar Registro</span> 
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function StudentSchedulePage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar semanas
  useEffect(() => {
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

  // Cargar clases
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
    
    // 1. Filtrar por día
    const filtered = currentWeekData.classes.filter((cls: any) => {
      const date = new Date(cls.class_date);
      let day = date.getUTCDay(); 
      day = day === 0 ? 6 : day - 1; 
      return day === dayIndex;
    });

    // 2. ORDENAR POR HORA (De más temprano a más tarde)
    return filtered.sort((a: any, b: any) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  };

  const handleReserve = () => {
    alert(`¡Reserva enviada para la clase ${selectedClass.id}!`);
    setSelectedClass(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 font-medium animate-pulse">Cargando agenda...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-[1800px] mx-auto">
      
      {/* HEADER */}
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

      {/* MALLA HORARIA */}
      {currentWeekData && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 xl:gap-6">
          {daysOfWeek.map((dayName, index) => {
            const dayClasses = getClassesForDay(index);
            // Detectar si es hoy (Aprox visual)
            const isToday = new Date().getDay() === (index + 1); 

            return (
              <div key={dayName} className="flex flex-col gap-4 min-h-[600px]">
                
                {/* Cabecera Día */}
                <div className={`text-center py-3 rounded-xl border ${isToday ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-transparent border-transparent text-gray-400'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">{dayName}</span>
                </div>

                {/* Columna de Tarjetas */}
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
                          {/* Hora Badge (Píldora superior) */}
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shadow-sm group-hover:bg-indigo-600 transition-colors">
                              {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                            </span>
                            {/* Icono estado */}
                            {cls.available_capacity === 0 && (
                               <i className="bi bi-lock-fill text-gray-300"></i>
                            )}
                          </div>

                          {/* Título */}
                          <h4 className="font-bold text-sm text-gray-900 leading-snug mb-4 line-clamp-2">
                            {cls.subject.name}
                          </h4>

                          {/* Footer: Profesor + Barra Progreso */}
                          <div className="pt-3 border-t border-gray-50">
                             <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-600 font-bold">
                                  {cls.professor.user.full_name.charAt(0)}
                                </div>
                                <span className="text-[11px] text-gray-500 font-medium truncate">
                                  {cls.professor.user.full_name.split(' ')[0]}
                                </span>
                             </div>

                             {/* Barra de Cupos Minimalista */}
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

      {/* Modal */}
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