import React from 'react';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC', 
    hour12: true
  });
};

interface ClassDetailModalProps {
  cls: any;
  onClose: () => void;
  onReserve: () => void;
}

export default function ClassDetailModal({ cls, onClose, onReserve }: ClassDetailModalProps) {
  if (!cls) return null;

  const occupancy = ((cls.max_capacity - cls.available_capacity) / cls.max_capacity) * 100;
  const isFull = cls.available_capacity === 0;

  const dateStr = new Date(cls.class_date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const startStr = formatTime(cls.start_time);
  const endStr = formatTime(cls.end_time);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-gray-900/50 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group">
              <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                <i className="bi bi-clock-history text-xl"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Horario</span>
              </div>
              <p className="text-gray-900 font-bold text-lg font-mono">
                {startStr} <span className="text-gray-300">/</span> {endStr}
              </p>
            </div>

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
               
               <div className="flex gap-1 h-2">
                  {[...Array(10)].map((_, i) => {
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

          <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-900 text-sm">
             <i className="bi bi-info-circle-fill mt-0.5 text-indigo-500"></i>
             <p className="leading-relaxed text-xs font-medium opacity-80">
                Recuerda llegar 15 minutos antes. Para cancelar esta reserva debes hacerlo con al menos 24 horas de antelación desde tu panel de usuario.
             </p>
          </div>
        </div>

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
                <span>Confirmar Reserva</span> 
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}