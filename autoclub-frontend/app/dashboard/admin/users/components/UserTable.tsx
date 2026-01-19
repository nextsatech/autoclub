import React from 'react';

interface UserTableProps {
  users: any[];
  onEdit: (user: any) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
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
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center text-gray-400 font-mono text-xs">#{user.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{user.full_name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        user.role.name === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role.name === 'student'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {user.role.name}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{user.document_number || 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                    >
                      <i className="bi bi-pencil-square text-lg"></i>
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                    >
                      <i className="bi bi-trash-fill text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}