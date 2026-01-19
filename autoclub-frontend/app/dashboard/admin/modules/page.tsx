'use client';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null); // Estado para saber si editamos

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/modules`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setModules(await res.json());
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name) return;
    const token = localStorage.getItem('token');
    
    // Lógica dual: Crear o Editar
    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `${API_URL}/modules/${editingId}` : `${API_URL}/modules`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name })
    });

    setName('');
    setEditingId(null); // Resetear estado
    loadData();
  };

  const handleEdit = (module: any) => {
    setEditingId(module.id);
    setName(module.name);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
  };

  const handleDelete = async (id: number) => {
    if(!confirm('¿Eliminar módulo?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/modules/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-black text-gray-900">Gestión de Módulos</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold mb-4">{editingId ? 'Editar Módulo' : 'Crear Módulo'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full p-3 border rounded-xl" placeholder="Ej: Módulo Teórico" 
              value={name} onChange={e => setName(e.target.value)} 
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="px-4 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 space-y-3">
          {modules.map(m => (
            <div key={m.id} className={`flex justify-between items-center p-4 bg-white rounded-xl border shadow-sm transition-all ${editingId === m.id ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-gray-100'}`}>
              <div>
                <h4 className="font-bold text-lg">{m.name}</h4>
                <p className="text-xs text-gray-400">{m.subjects?.length || 0} materias vinculadas</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(m)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}