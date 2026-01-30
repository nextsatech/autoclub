
import React from 'react';

interface ClassListProps {
  classes: any[];
  onDelete: (id: number) => void;
  onEdit: (cls: any) => void; // Nueva prop para editar
}

export default function ClassList({ classes, onDelete, onEdit }: ClassListProps) {
  
  const getProfName = (cls: any) => cls.professor?.user?.full_name || 'Sin Asignar';

  return (
    <div className="lg:col-span-2 space-y-4">
      <h2 className="font-bold text-lg text-gray-800">Clases Programadas</h2>
      
      {classes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
          <p>No hay clases registradas aún.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center group gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shrink-0">
                  <span className="text-xs font-bold uppercase">
                    {new Date(cls.class_date).toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' })}
                  </span>
                  <span className="text-xl font-black">
                    {new Date(cls.class_date).toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'UTC' })}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {cls.subject?.name || 'Clase Desconocida'}
                  </h3>
                  
                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 mt-1">
                    <span className="flex items-center gap-1 font-mono text-xs font-bold">
                      {new Date(cls.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZone: 'UTC'})} - 
                         {new Date(cls.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZone: 'UTC'})}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      {getProfName(cls)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start pl-16 sm:pl-0">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                  {cls.available_capacity} cupos
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(cls)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </button>
                  <button 
                    onClick={() => onDelete(cls.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}