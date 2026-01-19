import React, { useEffect, useState } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  user: any;
  roles: any[];
  licenses: any[];
}

export default function UserModal({ isOpen, onClose, onSave, user, roles, licenses }: UserModalProps) {
  const [formData, setFormData] = useState<any>({
    full_name: '',
    email: '',
    document_number: '',
    role_id: '',
    password: '',
    license_category_ids: [],
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          full_name: user.full_name,
          email: user.email,
          document_number: user.document_number,
          role_id: user.role_id,
          password: '',
          license_category_ids: user.student?.license_categories?.map((l: any) => l.id) || [],
        });
      } else {
        setFormData({
          full_name: '',
          email: '',
          document_number: '',
          role_id: roles.length > 0 ? roles[0].id : '',
          password: '',
          license_category_ids: [],
        });
      }
    }
  }, [isOpen, user, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleLicense = (id: number) => {
    const current = formData.license_category_ids || [];
    if (current.includes(id)) {
      setFormData({ ...formData, license_category_ids: current.filter((x: number) => x !== id) });
    } else {
      setFormData({ ...formData, license_category_ids: [...current, id] });
    }
  };

  const isStudent = () => {
    const role = roles.find((r) => r.id == formData.role_id);
    return role?.name === 'student';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg">{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded-full transition-colors">
            <i className="bi bi-x-lg text-gray-400"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
              <input
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Documento</label>
              <input
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input
              required
              type="email"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
            <select
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-black focus:outline-none"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {isStudent() && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-700 uppercase block mb-2">Licencias</label>
              <div className="grid grid-cols-2 gap-2">
                {licenses.map((lic) => (
                  <label key={lic.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.license_category_ids.includes(lic.id)}
                      onChange={() => toggleLicense(lic.id)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-sm text-blue-900">{lic.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={`text-xs font-bold uppercase ${user ? 'text-red-500' : 'text-gray-500'}`}>
              {user ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
            </label>
            <input
              type="password"
              required={!user}
              placeholder={user ? 'Dejar vacío para mantener actual' : ''}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-transform active:scale-[0.98]">
            {user ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}