'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:3000';

// --- TIPOS ---
interface LicenseCategory {
  id: number;
  name: string;
}

interface Module {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  categories: LicenseCategory[];
  module?: Module; // Ahora la materia puede traer su módulo
}

export default function SubjectsPage() {
  // Datos del Sistema
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<LicenseCategory[]>([]); 
  const [modules, setModules] = useState<Module[]>([]); // <--- FALTABA ESTO
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Datos del Formulario
  const [name, setName] = useState('');
  const [moduleId, setModuleId] = useState(''); // <--- FALTABA ESTO
  const [selectedCats, setSelectedCats] = useState<number[]>([]);

  // 1. Cargar Datos
  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resSub, resCat, resMod] = await Promise.all([
        fetch(`${API_URL}/subjects`, { headers }),
        fetch(`${API_URL}/license-categories`, { headers }),
        fetch(`${API_URL}/modules`, { headers })
      ]);

      if (resSub.ok) {
        const data = await resSub.json();
        setSubjects(Array.isArray(data) ? data : []);
      }

      if (resCat.ok) {
        const data = await resCat.json();
        setCategories(Array.isArray(data) ? data : []);
      }
      
      // Guardar módulos
      if (resMod.ok) {
        const data = await resMod.json();
        setModules(Array.isArray(data) ? data : []);
      }

    } catch (e) {
      console.error("Error de conexión:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Protección de Ruta
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role.name !== 'admin') {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
    
    loadData();
  }, []);

  const toggleCategory = (catId: number) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  // 2. Crear Materia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCats.length === 0) return alert('Selecciona al menos una categoría');

    const token = localStorage.getItem('token'); // <--- IMPORTANTE: Recuperar token

    try {
      const res = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- ENVIAR TOKEN
        },
        body: JSON.stringify({
          name,
          moduleId: moduleId ? Number(moduleId) : null, // <--- ENVIAR MÓDULO
          categoryIds: selectedCats
        })
      });

      if (res.ok) {
        alert('Materia creada');
        setName('');
        setModuleId(''); // Limpiar select
        setSelectedCats([]);
        loadData();
      } else {
        alert('Error al crear (Verifica permisos o datos)');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  // 3. Borrar Materia
  const handleDelete = async (id: number) => {
    if(!confirm('¿Borrar materia?')) return;
    const token = localStorage.getItem('token'); // Recuperar token

    await fetch(`${API_URL}/subjects/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` } // Enviar token
    });
    loadData();
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <h1 className="text-2xl font-bold">Gestión de Materias Académicas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h2 className="font-bold mb-4">Agregar Nueva Materia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre de la Materia</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-black transition-colors"
                placeholder="Ej: Mecánica de Motos Avanzada"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* --- AQUÍ ESTÁ EL SELECTOR DE MÓDULO QUE FALTABA --- */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Módulo Académico</label>
              
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white outline-none focus:border-black transition-colors"
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
              >
                <option value="">-- Sin Módulo --</option>
                {modules.map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
            </div>

            {/* Licencias */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Aplica para licencias:</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black"
                      checked={selectedCats.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Guardar Materia
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="md:col-span-2">
          <h2 className="font-bold mb-4">Materias en el Sistema ({subjects.length})</h2>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b uppercase text-xs">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Módulo</th> {/* Nueva Columna */}
                  <th className="p-4">Licencias</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
  {subjects.length === 0 ? (
    
    <tr>
      <td colSpan={4} className="p-8 text-center text-gray-400 italic">
        No hay materias registradas en el sistema.
      </td>
    </tr>
  ) : (
    
    subjects.map(sub => (
      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
        <td className="p-4 font-bold text-gray-900">{sub.name}</td>
        
        {/* Celda de Módulo */}
        <td className="p-4">
          {sub.module ? (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100">
              {sub.module.name}
            </span>
          ) : (
            <span className="text-gray-400 italic text-xs">General</span>
          )}
        </td>

        {/* Celda de Licencias */}
        <td className="p-4">
          <div className="flex flex-wrap gap-1">
            {sub.categories.map(c => (
              <span key={c.id} className="px-2 py-1 bg-gray-100 text-xs rounded border text-gray-600 font-medium">
                {c.name}
              </span>
            ))}
          </div>
        </td>

        {/* Botón Eliminar */}
        <td className="p-4 text-right">
          <button 
            onClick={() => handleDelete(sub.id)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
            title="Eliminar materia"
          >
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
    </div>
  );
}