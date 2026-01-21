'use client';

interface ScheduleHeaderProps {
  weeks: any[];
  selectedWeekId: string;
  onWeekChange: (id: string) => void;
}

export default function ScheduleHeader({ weeks, selectedWeekId, onWeekChange }: ScheduleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-100 pb-4 md:pb-6 gap-4 md:gap-6 sticky top-0 bg-zinc-50 z-10 pt-2 md:static">
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Tu Horario</h1>
        <p className="text-zinc-500 mt-1 text-xs md:text-lg font-medium">Reserva tus clases prácticas.</p>
      </div>

      <div className="relative group w-full md:w-auto min-w-[200px] md:min-w-[300px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 pointer-events-none text-indigo-600">
          <i className="bi bi-calendar4-week text-lg md:text-xl"></i>
        </div>
        <select 
          className="appearance-none bg-white border border-zinc-200 text-zinc-900 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-black focus:border-transparent block w-full pl-10 p-3 pr-8 font-bold cursor-pointer transition-all outline-none shadow-sm"
          value={selectedWeekId}
          onChange={(e) => onWeekChange(e.target.value)}
        >
          {weeks.map(w => (
            <option key={w.id} value={w.id}>
              {w.name} ({new Date(w.start_date).toLocaleDateString('es-CO', {timeZone: 'UTC', day:'numeric', month:'short'})})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 md:pr-4 pointer-events-none text-zinc-400">
          <i className="bi bi-chevron-down text-xs"></i>
        </div>
      </div>
    </div>
  );
}