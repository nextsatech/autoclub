'use client';

import { useEffect, useState } from 'react';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el Modal de Confirmación de borrado
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resUsers, resRoles, resLicenses] = await Promise.all([
        fetch(`${API_URL}/users`, { headers }),
        fetch(`${API_URL}/roles`, { headers }),
        fetch(`${API_URL}/license-categories`, { headers }),
      ]);
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resRoles.ok) setRoles(await resRoles.json());
      if (resLicenses.ok) setLicenses(await resLicenses.json());
    } catch (e) {
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.document_number?.includes(term)
    );
  });

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData: any) => {
    const token = localStorage.getItem('token');
    const method = selectedUser ? 'PATCH' : 'POST';
    const url = selectedUser ? `${API_URL}/users/${selectedUser.id}` : `${API_URL}/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(selectedUser ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  // 1. Solo abre el modal
  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  // 2. Ejecuta el borrado real
  const executeDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/users/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('Usuario eliminado', 'success');
        loadData();
      } else {
        const data = await res.json();
        showToast(`No se pudo eliminar: ${data.message}`, 'error');
      }
    } catch (error) {
      showToast('Error de red al eliminar', 'error');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Cargando sistema...</div>;

  return (
    <div className="p-8 space-y-6 animate-in fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos y roles del sistema.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-transform active:scale-95 whitespace-nowrap shadow-lg shadow-zinc-900/10"
          >
            + Nuevo
          </button>
        </div>
      </div>

      <UserTable users={filteredUsers} onEdit={handleOpenEdit} onDelete={handleDelete} />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        roles={roles}
        licenses={licenses}
      />

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Usuario?"
        message="Esta acción eliminará permanentemente al usuario y toda su información relacionada (historial, reservas, etc)."
        type="danger"
      />
    </div>
  );
}