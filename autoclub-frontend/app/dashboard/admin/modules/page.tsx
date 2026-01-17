'use client';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [newName, setNewName] = useState('');

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/modules`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setModules(await res.json());
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newName) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    loadData();
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
          <h3 className="font-bold mb-4">Crear Módulo</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input 
              className="w-full p-3 border rounded-xl" placeholder="Ej: Módulo Teórico" 
              value={newName} onChange={e => setNewName(e.target.value)} 
            />
            <button className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold">Guardar</button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-3">
          {modules.map(m => (
            <div key={m.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div>
                <h4 className="font-bold text-lg">{m.name}</h4>
                <p className="text-xs text-gray-400">{m.subjects?.length || 0} materias vinculadas</p>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i className="bi bi-trash"></i></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}