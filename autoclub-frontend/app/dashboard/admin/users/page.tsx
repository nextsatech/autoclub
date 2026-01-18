'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL EDITAR
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // MODAL CREAR (NUEVO)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({
    full_name: '', email: '', document_number: '', role_id: '', password: '', license_category_ids: []
  });

  // 1. Cargar Datos
  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resUsers, resRoles, resLicenses] = await Promise.all([
        fetch(`${API_URL}/users`, { headers }),
        fetch(`${API_URL}/roles`, { headers }),
        fetch(`${API_URL}/license-categories`, { headers })
      ]);
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resRoles.ok) setRoles(await resRoles.json());
      if (resLicenses.ok) setLicenses(await resLicenses.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- CREAR USUARIO ---
  const handleCreateClick = () => {
    // Resetear formulario y abrir modal
    setCreateFormData({
      full_name: '', email: '', document_number: '', 
      role_id: roles.length > 0 ? roles[0].id : '', // Seleccionar primer rol por defecto
      password: '', license_category_ids: []
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createFormData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Usuario creado exitosamente');
        setIsCreateModalOpen(false);
        loadData();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  const toggleCreateLicense = (id: number) => {
    const current = createFormData.license_category_ids || [];
    if (current.includes(id)) {
      setCreateFormData({ ...createFormData, license_category_ids: current.filter((x: number) => x !== id) });
    } else {
      setCreateFormData({ ...createFormData, license_category_ids: [...current, id] });
    }
  };

  // Helper para saber si el rol seleccionado en CREAR es estudiante
  const isCreateStudent = () => {
    const role = roles.find(r => r.id == createFormData.role_id);
    return role?.name === 'student';
  };

  // --- EDITAR USUARIO (Mismo de antes) ---
  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name, email: user.email, document_number: user.document_number,
      role_id: user.role_id, password: '', 
      license_category_ids: user.student?.license_categories?.map((l: any) => l.id) || []
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Usuario actualizado');
        setIsEditModalOpen(false);
        loadData();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  const toggleEditLicense = (id: number) => {
    const current = editFormData.license_category_ids || [];
    if (current.includes(id)) {
      setEditFormData({ ...editFormData, license_category_ids: current.filter((x: number) => x !== id) });
    } else {
      setEditFormData({ ...editFormData, license_category_ids: [...current, id] });
    }
  };

  const isEditStudent = () => {
    const role = roles.find(r => r.id == editFormData.role_id);
    return role?.name === 'student';
  };

  // --- ELIMINAR ---
  const handleDelete = async (id: number) => {
    if(!confirm('¿Estás seguro de eliminar este usuario?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
        <button onClick={handleCreateClick} className="bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800">
          + Nuevo Usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
            <tr>
              <th className="p-4 text-center w-16">ID</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Documento</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 text-center text-gray-400 font-mono text-xs">#{user.id}</td>
                <td className="p-4">
                  <p className="font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border 
                    ${user.role.name === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      user.role.name === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {user.role.name}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.document_number || 'N/A'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><i className="bi bi-pencil-square text-lg"></i></button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><i className="bi bi-trash-fill text-lg"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Crear Nuevo Usuario</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><i className="bi bi-x-lg text-gray-400"></i></button>
            </div>
            <form onSubmit={handleCreateSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                  <input required className="w-full p-2 border rounded-lg" value={createFormData.full_name} onChange={e => setCreateFormData({...createFormData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Documento</label>
                  <input required className="w-full p-2 border rounded-lg" value={createFormData.document_number} onChange={e => setCreateFormData({...createFormData, document_number: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input required type="email" className="w-full p-2 border rounded-lg" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                <select className="w-full p-2 border rounded-lg bg-white" value={createFormData.role_id} onChange={e => setCreateFormData({...createFormData, role_id: e.target.value})}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              
              {/* CHECKBOX LICENCIAS (SOLO SI ES ESTUDIANTE) */}
              {isCreateStudent() && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase block mb-2">Asignar Licencias</label>
                  <div className="grid grid-cols-2 gap-2">
                    {licenses.map(lic => (
                      <label key={lic.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={createFormData.license_category_ids.includes(lic.id)} onChange={() => toggleCreateLicense(lic.id)} className="w-4 h-4 accent-blue-600"/>
                        <span className="text-sm">{lic.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                <input required type="password" className="w-full p-2 border rounded-lg" value={createFormData.password} onChange={e => setCreateFormData({...createFormData, password: e.target.value})} />
              </div>
              
              <button className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800">Crear Usuario</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Editar Usuario</h3>
              <button onClick={() => setIsEditModalOpen(false)}><i className="bi bi-x-lg text-gray-400"></i></button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                  <input required className="w-full p-2 border rounded-lg" value={editFormData.full_name} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Documento</label>
                  <input className="w-full p-2 border rounded-lg" value={editFormData.document_number} onChange={e => setEditFormData({...editFormData, document_number: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input required type="email" className="w-full p-2 border rounded-lg" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                <select className="w-full p-2 border rounded-lg bg-white" value={editFormData.role_id} onChange={e => setEditFormData({...editFormData, role_id: e.target.value})}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* CHECKBOX LICENCIAS (EDITAR) */}
              {isEditStudent() && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase block mb-2">Licencias Habilitadas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {licenses.map(lic => (
                      <label key={lic.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editFormData.license_category_ids.includes(lic.id)} onChange={() => toggleEditLicense(lic.id)} className="w-4 h-4 accent-blue-600"/>
                        <span className="text-sm">{lic.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-red-500 uppercase">Cambiar Contraseña (Opcional)</label>
                <input type="password" placeholder="Dejar vacío para no cambiar" className="w-full p-2 border rounded-lg" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} />
              </div>
              
              <button className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}