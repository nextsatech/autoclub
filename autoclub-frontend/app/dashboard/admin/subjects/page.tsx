'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000'; // Ajusta si es necesario

// Tipos
interface LicenseCategory {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  categories: LicenseCategory[];
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<LicenseCategory[]>([]); // A2, B1, C1
  const [loading, setLoading] = useState(true);

  // Formulario
  const [name, setName] = useState('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);

  // Cargar datos al inicio
  const loadData = async () => {
    try {
      const resSub = await fetch(`${API_URL}/subjects`);
      const resCat = await fetch(`${API_URL}/license-categories`); // Necesitas crear este endpoint rápido o usar hardcode si prefieres
      // NOTA: Si no tienes endpoint de categorias, puedes usar estas fijas temporalmente:
      const catsData = [
         { id: 1, name: 'A2 (Moto)' },
         { id: 2, name: 'B1 (Carro Particular)' },
         { id: 3, name: 'C1 (Servicio Público)' }
      ];

      setSubjects(await resSub.json());
      setCategories(catsData); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manejar Checkbox de Categorías
  const toggleCategory = (catId: number) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  // Crear Materia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCats.length === 0) return alert('Selecciona al menos una categoría');

    try {
      const res = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryIds: selectedCats
        })
      });

      if (res.ok) {
        alert('Materia creada');
        setName('');
        setSelectedCats([]);
        loadData(); // Recargar lista
      }
    } catch (error) {
      alert('Error al crear');
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('¿Borrar materia?')) return;
    await fetch(`${API_URL}/subjects/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <h1 className="text-2xl font-bold">Gestión de Materias Académicas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE CREACIÓN */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h2 className="font-bold mb-4">Agregar Nueva Materia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre de la Materia</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-2 border rounded-lg"
                placeholder="Ej: Mecánica de Motos Avanzada"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Aplica para licencias:</label>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                      checked={selectedCats.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800">
              Guardar Materia
            </button>
          </form>
        </div>

        {/* LISTADO DE MATERIAS */}
        <div className="md:col-span-2">
          <h2 className="font-bold mb-4">Materias en el Sistema ({subjects.length})</h2>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Licencias</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{sub.name}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {sub.categories.map(c => (
                          <span key={c.id} className="px-2 py-1 bg-gray-100 text-xs rounded border">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}