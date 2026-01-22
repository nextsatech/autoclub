'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/modules`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setModules(await res.json());
    } catch (error) {
      showToast('Error de conexión', 'error');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name) return;
    const token = localStorage.getItem('token');
    
    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `${API_URL}/modules/${editingId}` : `${API_URL}/modules`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        showToast(editingId ? 'Módulo actualizado' : 'Módulo creado', 'success');
        setName('');
        setEditingId(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      showToast('Error de red', 'error');
    }
  };

  const handleEdit = (module: any) => {
    setEditingId(module.id);
    setName(module.name);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if(!deleteId) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/modules/${deleteId}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (res.ok) {
        showToast('Módulo eliminado', 'success');
        loadData();
      } else {
        showToast('No se pudo eliminar. Verifique dependencias.', 'error');
      }
    } catch (error) {
      showToast('Error de red', 'error');
    }
    setDeleteId(null);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-in fade-in relative">
      <h1 className="text-3xl font-black text-gray-900">Gestión de Módulos</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold mb-4">{editingId ? 'Editar Módulo' : 'Crear Módulo'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black" 
              placeholder="Ej: Módulo Teórico" 
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
                <button onClick={() => confirmDelete(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Módulo?"
        message="Esta acción no se puede deshacer. Asegúrate de que no haya materias vinculadas."
        type="danger"
      />
    </div>
  );
}