import React from 'react';

interface ClassFormProps {
  formData: any;
  setFormData: (data: any) => void;
  subjects: any[];
  instructors: any[];
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
}

export default function ClassForm({ 
  formData, 
  setFormData, 
  subjects, 
  instructors, 
  onSubmit, 
  isEditing, 
  onCancel 
}: ClassFormProps) {
  
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className={`w-8 h-8 ${isEditing ? 'bg-orange-500' : 'bg-black'} text-white rounded-full flex items-center justify-center text-sm`}>
          <i className={`bi ${isEditing ? 'bi-pencil-fill' : 'bi-plus-lg'}`}></i>
        </span>
        {isEditing ? 'Editar Clase' : 'Programar Clase'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Clase / Tema</label>
          <select 
            required
            className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-black focus:border-black outline-none"
            value={formData.subject_id}
            onChange={e => setFormData({...formData, subject_id: e.target.value})}
          >
            <option value="">Seleccionar clase...</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
          <input 
            type="date" 
            required
            className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black"
            value={formData.class_date}
            onChange={e => setFormData({...formData, class_date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Inicio</label>
            <input type="time" required className="w-full mt-1 p-2 border rounded-lg text-sm" 
              value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Fin</label>
            <input type="time" required className="w-full mt-1 p-2 border rounded-lg text-sm" 
              value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Cupos</label>
            <input 
              type="number" min="1" required
              className="w-full mt-1 p-2 border rounded-lg text-sm"
              value={formData.max_capacity}
              onChange={e => setFormData({...formData, max_capacity: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Instructor</label>
            <select 
              required
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white"
              value={formData.professor_id}
              onChange={e => setFormData({...formData, professor_id: e.target.value})}
            >
              <option value="">Seleccionar...</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.user?.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className={`w-full text-white py-3 rounded-lg font-bold transition-all mt-2 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-black hover:bg-gray-800'}`}>
          {isEditing ? 'Actualizar Clase' : 'Crear Clase'}
        </button>

        {isEditing && (
          <button 
            type="button" 
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
          >
            Cancelar Edición
          </button>
        )}
      </form>
    </div>
  );
}