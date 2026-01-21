'use client';

import ClassCard from './ClassCard';

interface ScheduleGridProps {
  currentWeekData: any;
  userRole: string;
  studentLicenses: number[];
  onClassClick: (cls: any) => void;
}

export default function ScheduleGrid({ currentWeekData, userRole, studentLicenses, onClassClick }: ScheduleGridProps) {
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Helper para obtener la fecha exacta de cada columna
  const getDateForDay = (dayIndex: number) => {
    if (!currentWeekData?.start_date) return null;
    // Asumimos que start_date es el Lunes de esa semana (UTC)
    const startDate = new Date(currentWeekData.start_date);
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + dayIndex);
    return date;
  };

  const getClassesForDay = (dayIndex: number) => {
    if (!currentWeekData) return [];
    
    const filtered = currentWeekData.classes.filter((cls: any) => {
      const date = new Date(cls.class_date);
      let day = date.getUTCDay(); 
      day = day === 0 ? 6 : day - 1; 
      if (day !== dayIndex) return false;

      if (!cls.subject) return false;

      // LÓGICA DE FILTRADO
      if (userRole === 'admin') return true;
      if (userRole === 'student') {
        const subjCats = cls.subject.categories || [];
        if (subjCats.length === 0) return true;
        if (studentLicenses.length === 0) return false;
        return subjCats.some((cat: any) => studentLicenses.includes(Number(cat.id)));
      }
      return true; 
    });

    return filtered.sort((a: any, b: any) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  };

  // Chequeo de "Hoy"
  const isDateToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6 xl:gap-8">
      {daysOfWeek.map((dayName, index) => {
        const dayClasses = getClassesForDay(index);
        const dateObj = getDateForDay(index);
        const isToday = isDateToday(dateObj);
        const dayNumber = dateObj ? dateObj.getUTCDate() : '';

        // MÓVIL: Si no hay clases, ocultamos el día para limpieza visual
        if (dayClasses.length === 0) {
           // Versión Desktop para días vacíos (siempre visible para mantener estructura)
           return (
             <div key={dayName} className="hidden md:flex flex-col gap-4 min-h-[600px] opacity-60">
                {/* Header Desktop Vacío */}
                <div className="flex flex-col items-center py-4 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{dayName.slice(0, 3)}</span>
                  <span className={`text-xl font-medium text-gray-300 w-8 h-8 flex items-center justify-center rounded-full`}>
                    {dayNumber}
                  </span>
                </div>
                {/* Estado Vacío Elegante */}
                <div className="flex-1 rounded-2xl border border-dashed border-gray-200 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')] opacity-30 flex items-center justify-center">
                </div>
             </div>
           );
        }

        return (
          <div key={dayName} className="flex flex-col gap-3 md:gap-4 min-h-[auto] md:min-h-[600px]">
            
            {/* ================= HEADER DEL DÍA (ESTILO CALENDARIO) ================= */}
            
            {/* Versión MÓVIL: Sticky Header con Fecha */}
            <div className="flex items-center gap-4 py-3 md:hidden sticky top-[4.5rem] bg-zinc-50/95 backdrop-blur-sm z-10 border-b border-zinc-200/50">
              <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl shadow-sm border ${isToday ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-200'}`}>
                <span className="text-xs font-bold leading-none">{dayNumber}</span>
                <span className="text-[8px] font-medium uppercase leading-none mt-0.5">{dayName.slice(0, 3)}</span>
              </div>
              <div className="h-px bg-zinc-200 flex-1"></div>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {dayClasses.length} {dayClasses.length === 1 ? 'Clase' : 'Clases'}
              </span>
            </div>

            {/* Versión ESCRITORIO: Columna Clásica */}
            <div className="hidden md:flex flex-col items-center py-2 border-b border-zinc-200 pb-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isToday ? 'text-indigo-600' : 'text-zinc-400'}`}>
                {dayName.slice(0, 3)}
              </span>
              <div className={`
                text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-all
                ${isToday 
                  ? 'bg-black text-white shadow-lg shadow-zinc-900/20 scale-110' 
                  : 'text-zinc-800 hover:bg-zinc-100'}
              `}>
                {dayNumber}
              </div>
            </div>

            {/* ================= LISTA DE CLASES ================= */}
            <div className="flex flex-col gap-3 md:gap-4 h-full relative">
              {/* Línea de tiempo decorativa (Solo móvil) */}
              <div className="absolute left-[1.2rem] top-0 bottom-0 w-px bg-zinc-200 md:hidden -z-10"></div>

              {dayClasses.map((cls: any) => (
                <ClassCard key={cls.id} cls={cls} onClick={onClassClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}