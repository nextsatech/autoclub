// app/dashboard/admin/classes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';
import { API_URL } from '@/app/config/api';
import ClassForm from './components/ClassForm'; // Asegúrate de crear la carpeta components
import ClassList from './components/ClassList';

// Interfaces (Puedes moverlas a un archivo types.ts si prefieres)
interface User { id: number; full_name: string; }
interface Professor { id: number; user: User; }
interface Subject { id: number; name: string; }
interface ClassSession {
  id: number;
  subject?: Subject;
  class_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number; // Agregado para poder editar
  available_capacity: number;
  professor?: Professor;
  professor_id?: number; // Útil para el form
  subject_id?: number;   // Útil para el form
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [instructors, setInstructors] = useState<Professor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Estado para la Edición
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    subject_id: '',
    class_date: '',
    start_time: '',
    end_time: '',
    max_capacity: 5,
    professor_id: ''
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [resClasses, resProfessors, resSubjects] = await Promise.all([
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/professors`, { headers }),
        fetch(`${API_URL}/subjects`, { headers })
      ]);

      if (resClasses.ok) setClasses(await resClasses.json());
      if (resProfessors.ok) setInstructors(await resProfessors.json());
      if (resSubjects.ok) setSubjects(await resSubjects.json());

    } catch (error) {
      showToast('Error de conexión al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LÓGICA DE EDICIÓN ---
  const handleEditClick = (cls: ClassSession) => {
    setEditingClass(cls);
    
    // Convertir fechas ISO a formatos para input (YYYY-MM-DD y HH:MM)
    // Nota: Asumimos que class_date viene en ISO UTC.
    const dateObj = new Date(cls.class_date);
    const startObj = new Date(cls.start_time);
    const endObj = new Date(cls.end_time);

    // Ajuste simple para extraer la fecha (considerando que el input date espera YYYY-MM-DD)
    const formattedDate = dateObj.toISOString().split('T')[0]; 
    const formattedStart = startObj.toISOString().split('T')[1].substring(0, 5); // HH:MM
    const formattedEnd = endObj.toISOString().split('T')[1].substring(0, 5);     // HH:MM

    setFormData({
      subject_id: cls.subject?.id.toString() || '',
      class_date: formattedDate,
      start_time: formattedStart,
      end_time: formattedEnd,
      max_capacity: cls.max_capacity || 5,
      professor_id: cls.professor?.id.toString() || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setFormData({
      subject_id: '',
      class_date: '',
      start_time: '',
      end_time: '',
      max_capacity: 5,
      professor_id: ''
    });
  };

  // --- SUBMIT (CREAR O ACTUALIZAR) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Construir fechas ISO manualmente para mantener el UTC
    const isoStart = `${formData.class_date}T${formData.start_time}:00.000Z`;
    const isoEnd = `${formData.class_date}T${formData.end_time}:00.000Z`;

    const payload = {
      subject_id: Number(formData.subject_id),
      class_date: isoStart,
      start_time: isoStart,
      end_time: isoEnd,
      max_capacity: Number(formData.max_capacity),
      professor_id: Number(formData.professor_id)
    };

    try {
      let url = `${API_URL}/classes`;
      let method = 'POST';
      let successMsg = 'Clase creada correctamente';

      // Si estamos editando, cambiamos URL y método
      if (editingClass) {
        url = `${API_URL}/classes/${editingClass.id}`;
        method = 'PATCH'; // O 'PUT' dependiendo de tu backend
        successMsg = 'Clase actualizada correctamente';
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en la operación');
      }
      
      showToast(successMsg, 'success');
      handleCancelEdit(); // Limpia el formulario y el estado de edición
      loadData(); // Recarga la lista

    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  // --- ELIMINAR ---
  const confirmDelete = (id: number) => setDeleteId(id);

  const executeDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/classes/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== deleteId));
        showToast('Clase eliminada', 'success');
        // Si borramos la clase que se estaba editando, limpiamos el form
        if (editingClass?.id === deleteId) handleCancelEdit();
      } else {
        const err = await res.json();
        showToast(`Error: ${err.message}`, 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="p-10 text-gray-500">Cargando panel...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 relative">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Clases</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMPONENTE FORMULARIO */}
        <ClassForm 
          formData={formData}
          setFormData={setFormData}
          subjects={subjects}
          instructors={instructors}
          onSubmit={handleSubmit}
          isEditing={!!editingClass}
          onCancel={handleCancelEdit}
        />

        {/* COMPONENTE LISTA */}
        <ClassList 
          classes={classes}
          onDelete={confirmDelete}
          onEdit={handleEditClick}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Clase?"
        message="Esta acción eliminará la clase y todas las reservas asociadas. No se puede deshacer."
        type="danger"
      />
    </div>
  );
}