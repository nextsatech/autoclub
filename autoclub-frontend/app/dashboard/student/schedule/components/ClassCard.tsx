'use client';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: true
  });
};

interface ClassCardProps {
  cls: any;
  onClick: (cls: any) => void;
}

export default function ClassCard({ cls, onClick }: ClassCardProps) {
  const occupancyPercent = ((cls.max_capacity - cls.available_capacity) / cls.max_capacity) * 100;
  const isFull = cls.available_capacity === 0;

  return (
    <div 
      onClick={() => onClick(cls)}
      className="group relative bg-white rounded-2xl shadow-sm border border-zinc-100 cursor-pointer overflow-hidden hover:border-indigo-200 transition-all active:scale-[0.98]"
    >
      {/* ================= VISTA MÓVIL (Compacta / Lista) ================= */}
      <div className="flex items-center p-3 gap-3 md:hidden">
        
        {/* 1. Columna Hora (Izquierda) */}
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] text-center border-r border-zinc-100 pr-3">
          <span className="text-xs font-black text-zinc-800 leading-none">
            {formatTime(cls.start_time).split(' ')[0]}
          </span>
          <span className="text-[9px] text-zinc-400 font-medium uppercase mt-0.5">
            {formatTime(cls.start_time).split(' ')[1]}
          </span>
          <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isFull ? 'bg-red-400' : 'bg-green-400'}`}></div>
        </div>

        {/* 2. Info Principal (Centro) */}
        <div className="flex-1 min-w-0"> {/* min-w-0 evita que el texto rompa el flex */}
          <h4 className="text-sm font-bold text-zinc-900 truncate leading-tight mb-0.5">
            {cls.subject.name}
          </h4>
          <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
            <i className="bi bi-person-circle text-[10px]"></i> 
            {cls.professor.user.full_name}
          </p>
        </div>

        {/* 3. Estado / Cupos (Derecha) */}
        <div className="flex flex-col items-end justify-center pl-2">
          {isFull ? (
            <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-1 rounded-md border border-red-100">
              LLENO
            </span>
          ) : (
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-indigo-100">
              Reservar
            </span>
          )}
          {!isFull && (
            <span className="text-[9px] text-zinc-400 mt-1 font-medium">
              {cls.available_capacity} cupos
            </span>
          )}
        </div>
      </div>


      {/* ================= VISTA ESCRITORIO (Tarjeta Completa) ================= */}
      <div className="hidden md:block p-5">
        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all bg-indigo-500 group-hover:w-1.5"></div>
        
        <div className="pl-3">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shadow-sm">
              {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
            </span>
            {isFull && <i className="bi bi-lock-fill text-zinc-300"></i>}
          </div>

          <h4 className="font-bold text-sm text-zinc-900 leading-snug mb-4 line-clamp-2">
            {cls.subject.name}
          </h4>

          <div className="pt-3 border-t border-zinc-50">
             <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-600 font-bold border border-zinc-200">
                  {cls.professor.user.full_name.charAt(0)}
                </div>
                <span className="text-[11px] text-zinc-500 font-medium truncate">
                  {cls.professor.user.full_name.split(' ')[0]}
                </span>
             </div>

             {/* Barra de progreso de cupos */}
             <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-colors ${isFull ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${occupancyPercent > 0 ? occupancyPercent : 10}%` }} 
                ></div>
             </div>
             
             <div className="flex justify-between mt-1">
               <span className="text-[9px] text-zinc-400 font-bold uppercase">Cupos</span>
               <span className={`text-[9px] font-bold ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                 {cls.available_capacity} libres
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}