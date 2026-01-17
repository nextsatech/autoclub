'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/license-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error(error);
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
        body: JSON.stringify({ name: newName.toUpperCase() }) // Guardar en mayúsculas
      });

      if (res.ok) {
        setNewName('');
        loadData();
        alert('Categoría creada');
      } else {
        alert('Error (quizás ya existe)');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar categoría? Esto podría afectar estudiantes.')) return;
    const token = localStorage.getItem('token');
    
    await fetch(`${API_URL}/license-categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  };

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in max-w-4xl">
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
                className="w-full mt-1 p-3 border rounded-lg font-bold uppercase"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800">
              Guardar
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-all">
              <div>
                <h3 className="text-2xl font-black text-gray-900">{cat.name}</h3>
                <div className="text-xs text-gray-500 mt-1 space-x-2">
                  <span>👨‍🎓 {cat._count?.students || 0} alumnos</span>
                  <span>📚 {cat._count?.subjects || 0} materias</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}