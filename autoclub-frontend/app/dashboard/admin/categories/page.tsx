'use client';

import { useEffect, useState } from 'react';
// Asegúrate de que estas rutas sean correctas según donde creaste los archivos
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal'; 

import { API_URL } from '@/app/config/api';

export default function CategoriesPage() {
  // Estado para saber QUÉ categoría se va a borrar (si es null, el modal está cerrado)
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/license-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error(error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/license-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.toUpperCase() })
      });

      if (res.ok) {
        setNewName('');
        loadData();
        showToast('Categoría creada exitosamente', 'success');
      } else {
        // CORREGIDO: Usamos 'error' en lugar de 'success' para errores
        showToast('Error: Quizás la categoría ya existe', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de red', 'error');
    }
  };

  // 1. Función que solo ABRE el modal (guarda el ID)
  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  // 2. Función que EJECUTA el borrado (se llama desde el modal)
  const executeDelete = async () => {
    if (!deleteId) return; // Seguridad

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/license-categories/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('Categoría eliminada', 'success');
        loadData();
      } else {
        showToast('No se pudo eliminar. Verifique dependencias.', 'error');
      }
    } catch (error) {
      showToast('Error al intentar eliminar', 'error');
    }
    setDeleteId(null); // Cerramos el modal y limpiamos
  };

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Cargando datos...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in max-w-4xl relative">
      <h1 className="text-2xl font-bold text-gray-900">Categorías de Licencia</h1>
      <p className="text-gray-500">Define los tipos de licencia que ofrece la escuela (Ej: A2, B1, C2).</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4">Nueva Categoría</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Código / Nombre</label>
              <input 
                type="text" 
                placeholder="Ej: C3" 
                required
                className="w-full mt-1 p-3 border rounded-lg font-bold uppercase focus:ring-2 focus:ring-black outline-none transition-all"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10">
              Guardar
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-10 border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
              No hay categorías registradas aún.
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-indigo-100 hover:shadow-md transition-all">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{cat.name}</h3>
                  <div className="text-xs text-gray-500 mt-1 space-x-2 font-medium">
                    <span className="bg-gray-50 px-2 py-1 rounded">👨‍🎓 {cat._count?.students || 0} alumnos</span>
                    <span className="bg-gray-50 px-2 py-1 rounded">📚 {cat._count?.subjects || 0} clases</span>
                  </div>
                </div>
                <button 
                  onClick={() => confirmDelete(cat.id)} 
                  className="w-9 h-9 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                  title="Eliminar categoría"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- AQUÍ ESTÁ EL MODAL --- */}
      <ConfirmModal 
        isOpen={!!deleteId}               // Se abre si deleteId tiene un número
        onClose={() => setDeleteId(null)} // Se cierra si el usuario cancela
        onConfirm={executeDelete}         // Ejecuta la función real si confirma
        title="¿Eliminar Categoría?"
        message="Esta acción no se puede deshacer. Si hay estudiantes o clases ligadas a esta categoría, podría fallar."
        type="danger"
      />
    </div>
  );
}