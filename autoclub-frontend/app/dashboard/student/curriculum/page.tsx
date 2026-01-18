'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

interface Category { id: number; name: string; }
interface Subject { id: number; name: string; moduleId: number; categories: Category[]; }
interface Module { id: number; name: string; subjects?: Subject[]; }

export default function CurriculumPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
       const [resMod, resSub] = await Promise.all([
          fetch(`${API_URL}/modules`, { headers }),
          fetch(`${API_URL}/subjects`, { headers }) 
        ]);

        if (resMod.ok && resSub.ok) {
          const modulesData = await resMod.json();
          const subjectsData = await resSub.json();

          const mergedData = modulesData.map((mod: Module) => ({
            ...mod,
            subjects: subjectsData.filter((sub: Subject) => sub.moduleId === mod.id)
          }));

          setModules(mergedData);
        }
      } catch (error) {
        console.error("Error cargando malla:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleAccordion = (id: number) => {
    setOpenModuleId(openModuleId === id ? null : id);
  };

  const getLicenseColor = (name: string) => {
    if (name.includes('A')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (name.includes('B')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('C')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Cargando malla curricular...</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tu Malla Curricular</h1>
        <p className="text-gray-500 mt-2 text-lg">Explora los módulos y materias de tu plan de estudios.</p>
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
            No hay módulos configurados.
          </div>
        ) : (
          modules.map((mod) => {
            const isOpen = openModuleId === mod.id;
            const subjectCount = mod.subjects?.length || 0;

            return (
              <div 
                key={mod.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-md border-indigo-200' : 'shadow-sm border-gray-200 hover:border-indigo-300'}`}
              >
                <button 
                  onClick={() => toggleAccordion(mod.id)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                      {isOpen ? <i className="bi bi-folder2-open"></i> : <i className="bi bi-folder2"></i>}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isOpen ? 'text-indigo-900' : 'text-gray-900'}`}>{mod.name}</h3>
                      <p className="text-sm text-gray-500">{subjectCount} {subjectCount === 1 ? 'Materia' : 'Materias'}</p>
                    </div>
                  </div>
                  <i className={`bi bi-chevron-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}></i>
                </button>

                <div className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                  <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50/30">
                    <div className="grid gap-3 pt-4">
                      {subjectCount === 0 ? (
                        <p className="text-sm text-gray-400 italic">No hay materias en este módulo.</p>
                      ) : (
                        mod.subjects?.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                              <span className="font-bold text-gray-700 text-sm md:text-base">{sub.name}</span>
                            </div>

                         
                            <div className="flex flex-wrap gap-2 justify-end">
                              {sub.categories && sub.categories.length > 0 ? (
                                sub.categories.map((cat) => (
                                  <span 
                                    key={cat.id} 
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getLicenseColor(cat.name)}`}
                                  >
                                    {cat.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200 font-bold">
                                  GENERAL
                                </span>
                              )}
                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}