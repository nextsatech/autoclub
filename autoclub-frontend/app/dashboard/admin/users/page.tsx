'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

interface Role { id: number; name: string; } // Nuevo tipo
interface License { id: number; name: string; }
interface UserData {
  id: number; // Ahora el ID principal puede ser del User
  full_name: string;
  email: string;
  document_type?: string;
  document_number?: string;
  role: Role;
  student?: { id: number; license_categories: License[] }; // Puede ser opcional si es Admin
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]); // Cambiamos students por users
  const [allLicenses, setAllLicenses] = useState<License[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // Estado para roles
  
  const initialFormState = {
    full_name: '',
    email: '',
    password: '',
    document_type: 'CC',
    document_number: '',
    role_id: '', // Nuevo campo en formulario
  };
  const [formData, setFormData] = useState(initialFormState);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<number[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  // Cargar datos
  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Cargamos Usuarios, Licencias y ROLES
      const [resUsers, resLicenses, resRoles] = await Promise.all([
        fetch(`${API_URL}/students`, { headers }), // Ahora este endpoint devuelve Users (según el cambio en backend)
        fetch(`${API_URL}/license-categories`, { headers }),
        fetch(`${API_URL}/roles`, { headers }) // Necesitarás este endpoint, si no existe lo creamos abajo*
      ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resLicenses.ok) setAllLicenses(await resLicenses.json());
      if (resRoles.ok) setRoles(await resRoles.json());

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleLicense = (id: number) => {
    setSelectedLicenseIds(prev => 
      prev.includes(id) ? prev.filter(licId => licId !== id) : [...prev, id]
    );
  };

  const openModal = (user?: UserData) => {
    if (user) {
      // EDICIÓN
      setEditingUserId(user.student?.id || user.id); // Ojo con esto en el update
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '', 
        document_type: user.document_type || 'CC',
        document_number: user.document_number || '',
        role_id: user.role.id.toString(),
      });
      // Solo cargamos licencias si es estudiante
      setSelectedLicenseIds(user.student?.license_categories.map(l => l.id) || []);
    } else {
      // CREACIÓN
      setEditingUserId(null);
      setFormData(initialFormState);
      setSelectedLicenseIds([]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const isEditing = editingUserId !== null;

    if (!formData.role_id) {
      alert("Debes seleccionar un rol");
      return;
    }

    const payload: any = {
      ...formData,
      role_id: Number(formData.role_id), // Convertir a número
      categoryIds: selectedLicenseIds
    };

    if (isEditing && !payload.password) delete payload.password;

    try {
      // NOTA: Para editar, seguimos usando la lógica de estudiante por ahora
      // Para crear, usamos la nueva lógica multi-rol
      const url = isEditing 
        ? `${API_URL}/students/${editingUserId}` 
        : `${API_URL}/students`;                    
      
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? '✅ Usuario actualizado' : '✅ Usuario creado');
        setIsModalOpen(false);
        loadData(); 
      } else {
        alert(`❌ Error: ${data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10">Cargando panel...</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
          <i className="bi bi-person-plus-fill"></i> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
            <tr>
              <th className="p-4">Rol</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Detalles / Licencias</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${user.role.name === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : user.role.name === 'professor' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {user.role.name}
                  </span>
                </td>
                <td className="p-4 text-gray-600 font-mono text-xs">
                   {user.document_type} {user.document_number}
                </td>
                <td className="p-4 font-bold text-gray-900">{user.full_name}</td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4">
                  {user.role.name === 'student' && user.student ? (
                    <div className="flex flex-wrap gap-1">
                      {user.student.license_categories.length > 0 ? (
                        user.student.license_categories.map(lic => (
                          <span key={lic.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-bold">
                            {lic.name}
                          </span>
                        ))
                      ) : <span className="text-gray-400 italic text-xs">Sin licencias</span>}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {/* Solo permitimos editar Estudiantes por ahora con el endpoint actual */}
                  {user.role.name === 'student' && (
                    <button onClick={() => openModal(user)} className="text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1 rounded transition-colors text-xs">
                      <i className="bi bi-pencil-square mr-1"></i> Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUserId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ROL SELECTOR */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Rol de Usuario</label>
                <select 
                  required
                  className="w-full mt-1 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-black outline-none"
                  value={formData.role_id}
                  onChange={e => setFormData({...formData, role_id: e.target.value})}
                  disabled={editingUserId !== null} // No cambiar rol al editar por seguridad
                >
                  <option value="">Seleccionar Rol...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* DOCUMENTO */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                  <select 
                    className="w-full mt-1 p-3 border rounded-lg bg-white"
                    value={formData.document_type}
                    onChange={e => setFormData({...formData, document_type: e.target.value})}
                  >
                    <option value="CC">C.C.</option>
                    <option value="TI">T.I.</option>
                    <option value="CE">C.E.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Número</label>
                  <input required type="text" className="w-full mt-1 p-3 border rounded-lg"
                    value={formData.document_number} onChange={e => setFormData({...formData, document_number: e.target.value})} />
                </div>
              </div>

              {/* DATOS PERSONALES */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                <input required type="text" className="w-full mt-1 p-3 border rounded-lg"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input required type="email" className="w-full mt-1 p-3 border rounded-lg"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                <input 
                  required={editingUserId === null} 
                  type="password" 
                  className="w-full mt-1 p-3 border rounded-lg"
                  placeholder={editingUserId ? "Dejar en blanco para mantener" : "******"}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              {/* LICENCIAS (Solo mostrar si es Estudiante) */}
              {/* Buscamos si el rol seleccionado es 'student' */}
              {roles.find(r => r.id.toString() === formData.role_id)?.name === 'student' && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Licencias a Cursar</label>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                    {allLicenses.map(lic => (
                      <label key={lic.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm ${selectedLicenseIds.includes(lic.id) ? 'bg-white border-indigo-500 text-indigo-700' : ''}`}>
                        <input type="checkbox" className="accent-indigo-600"
                          checked={selectedLicenseIds.includes(lic.id)}
                          onChange={() => toggleLicense(lic.id)}
                        />
                        <span className="font-bold">{lic.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}