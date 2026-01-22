'use client';

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

  // 1. CONFIGURACIÓN WHATSAPP ADMIN
  const ADMIN_PHONE = "573001234567"; // ⚠️ PON AQUÍ EL NÚMERO REAL DEL ADMIN

  // Cálculos de fecha y hora
  const dateObj = new Date(cls.class_date);
  const dayOfWeek = dateObj.getUTCDay(); // 0 = Domingo, 6 = Sábado
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Cálculos de capacidad
  const total = cls.max_capacity;
  const available = cls.available_capacity;
  const occupied = total - available;
  const occupancyPercentage = (occupied / total) * 100;
  const isFull = available === 0;

  const dateStr = dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const startStr = formatTime(cls.start_time);
  const endStr = formatTime(cls.end_time);

  // 2. FUNCIÓN PARA REDIRIGIR A WHATSAPP
  const handleWhatsAppRequest = () => {
    const message = `Hola AutoClub, deseo reservar un cupo manual para la clase de *${cls.subject.name}* el día *${dateStr}* a las *${startStr}*. Quedo atento a la confirmación.`;
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                ${isWeekend ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>
                <i className={`bi ${isWeekend ? 'bi-star-fill' : 'bi-calendar4'}`}></i> 
                {isWeekend ? 'Fin de Semana' : dateStr}
              </span>
              {isFull && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                  Agotado
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight tracking-tight capitalize">
              {cls.subject.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-zinc-50 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {/* AVISO ESPECIAL FIN DE SEMANA */}
          {isWeekend && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
              <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="bi bi-whatsapp"></i>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Reserva Manual Requerida</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Las clases de fin de semana requieren aprobación directa del administrador.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            {/* Tarjeta Horario */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors group">
              <div className="flex items-center gap-3 mb-2 text-zinc-400 group-hover:text-indigo-600 transition-colors">
                <i className="bi bi-clock-history text-xl"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Horario</span>
              </div>
              <p className="text-zinc-900 font-bold text-lg font-mono">
                {startStr} <span className="text-zinc-300">/</span> {endStr}
              </p>
            </div>

            {/* Tarjeta Instructor */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors group">
              <div className="flex items-center gap-3 mb-2 text-zinc-400 group-hover:text-indigo-600 transition-colors">
                <i className="bi bi-person-badge text-xl"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Instructor</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700 shadow-sm">
                    {cls.professor.user.full_name.charAt(0)}
                 </div>
                 <p className="text-zinc-900 font-bold text-sm truncate">
                    {cls.professor.user.full_name}
                 </p>
              </div>
            </div>

            {/* Tarjeta Disponibilidad */}
            <div className="col-span-1 md:col-span-2 p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                     <i className="bi bi-people text-xl"></i>
                     <span className="text-xs font-bold uppercase tracking-wider">Cupos</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {cls.available_capacity} disponibles
                  </span>
               </div>
               
               <div className="flex gap-1.5 h-2.5">
                  {[...Array(10)].map((_, i) => {
                     const slotValue = (i + 1) * 10;
                     const isTaken = occupancyPercentage >= slotValue;
                     return (
                        <div 
                           key={i} 
                           className={`flex-1 rounded-full transition-all duration-500 
                             ${isTaken ? 'bg-zinc-300' : 'bg-indigo-500'}
                           `}
                        ></div>
                     );
                  })}
               </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900 text-sm">
             <i className="bi bi-info-circle-fill mt-0.5 text-blue-500"></i>
             <p className="leading-relaxed text-xs font-medium opacity-80">
                Recuerda llegar 15 minutos antes. Para cancelar esta reserva debes hacerlo con antelación desde tu panel.
             </p>
          </div>
        </div>

        {/* FOOTER - LÓGICA DE BOTONES */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          
          {isWeekend ? (
             // --- BOTÓN PARA FINES DE SEMANA (WHATSAPP) ---
             <button 
              onClick={handleWhatsAppRequest}
              className="w-full py-4 rounded-xl font-bold text-base tracking-wide shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] bg-green-600 text-white hover:bg-green-700 hover:shadow-green-600/20"
            >
              <span>Solicitar por WhatsApp</span> 
              <i className="bi bi-whatsapp"></i>
            </button>

          ) : (
            // --- BOTÓN NORMAL (RESERVA AUTOMÁTICA) ---
            <button 
              onClick={onReserve}
              disabled={isFull}
              className={`w-full py-4 rounded-xl font-bold text-base tracking-wide shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                ${isFull 
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none' 
                  : 'bg-black text-white hover:bg-zinc-800 hover:shadow-xl'}`}
            >
              {isFull ? (
                <span>Lista de Espera (Lleno)</span>
              ) : (
                <> 
                  <span>Reservar Clase</span> 
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}