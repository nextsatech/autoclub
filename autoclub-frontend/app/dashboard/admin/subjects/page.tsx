'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

interface LicenseCategory { id: number; name: string; }
interface Module { id: number; name: string; }
interface Subject { id: number; name: string; categories: LicenseCategory[]; module?: Module; }

export default function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<LicenseCategory[]>([]); 
  const [modules, setModules] = useState<Module[]>([]); 
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [name, setName] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resSub, resCat, resMod] = await Promise.all([
        fetch(`${API_URL}/subjects`, { headers }),
        fetch(`${API_URL}/license-categories`, { headers }),
        fetch(`${API_URL}/modules`, { headers })
      ]);
      if (resSub.ok) setSubjects(await resSub.json());
      if (resCat.ok) setCategories(await resCat.json());
      if (resMod.ok) setModules(await resMod.json());
    } catch (e) { 
      showToast('Error de conexión', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setModuleId(sub.module ? sub.module.id.toString() : '');
    setSelectedCats(sub.categories.map(c => c.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setModuleId('');
    setSelectedCats([]);
  };

  const toggleCategory = (catId: number) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCats.length === 0) return showToast('Selecciona al menos una categoría', 'error'); 
    const token = localStorage.getItem('token');

    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `${API_URL}/subjects/${editingId}` : `${API_URL}/subjects`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name,
          moduleId: moduleId ? Number(moduleId) : null,
          categoryIds: selectedCats
        })
      });

      if (res.ok) {
        showToast(editingId ? 'Materia actualizada' : 'Materia creada', 'success');
        handleCancel();
        loadData();
      } else {
        showToast('Error al guardar', 'error');
      }
    } catch (error) { 
      showToast('Error de conexión', 'error'); 
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/subjects/${deleteId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (res.ok) {
        showToast('Materia eliminada', 'success');
        loadData();
      } else {
        showToast('No se puede eliminar. Verifique si tiene clases asignadas.', 'error');
      }
    } catch (error) {
      showToast('Error de red al eliminar', 'error');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando materias...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
        {editingId && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            Modo Edición Activo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className={`bg-white p-6 rounded-xl border shadow-sm h-fit transition-all ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
          <h2 className="font-bold mb-4 flex justify-between items-center">
            {editingId ? 'Editar Materia' : 'Nueva Materia'}
            {editingId && <button onClick={handleCancel} className="text-xs text-red-500 hover:underline">Cancelar</button>}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
              <input 
                type="text" required
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                value={name} onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Módulo</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white outline-none focus:border-black focus:ring-1 focus:ring-black"
                value={moduleId} onChange={e => setModuleId(e.target.value)}
              >
                <option value="">-- General / Sin Módulo --</option>
                {modules.map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Licencias</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black rounded"
                      checked={selectedCats.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10">
                {editingId ? 'Actualizar Cambios' : 'Guardar Materia'}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Módulo</th>
                  <th className="p-4">Licencias</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">No hay materias registradas.</td>
                  </tr>
                ) : (
                  subjects.map(sub => (
                    <tr key={sub.id} className={`hover:bg-gray-50 transition-colors ${editingId === sub.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4 font-bold text-gray-900">{sub.name}</td>
                      <td className="p-4">
                        {sub.module ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100">
                            {sub.module.name}
                          </span>
                        ) : <span className="text-gray-400 text-xs italic">General</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.categories.map(c => (
                            <span key={c.id} className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200 text-gray-600 font-bold">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button onClick={() => handleEdit(sub)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Editar">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button onClick={() => confirmDelete(sub.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar">
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Materia?"
        message="Esta acción eliminará la materia. Si tiene clases activas o historial, podría fallar o causar inconsistencias."
        type="danger"
      />
    </div>
  );
}