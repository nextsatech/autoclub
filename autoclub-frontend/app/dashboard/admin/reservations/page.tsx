'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

export default function AdminReservationsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(''); // <--- NUEVO ESTADO PARA FECHA

  // Selección
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resStudents, resClasses] = await Promise.all([
        fetch(`${API_URL}/students`, { headers }), 
        fetch(`${API_URL}/classes`, { headers })   
      ]);

      if (resStudents.ok) setStudents(await resStudents.json());
      if (resClasses.ok) setClasses(await resClasses.json());

    } catch (error) {
      showToast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtro de Estudiantes
  const filteredStudents = students.filter(s => 
    s.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user?.document_number?.includes(searchTerm)
  );

  // Filtro de Clases (Fecha y Cupo)
  const filteredClasses = classes
    .filter(c => {
      // 1. Filtrar clases pasadas
      const isFuture = new Date(c.class_date) >= new Date(new Date().setHours(0,0,0,0));
      // 2. Filtrar por fecha seleccionada (si existe)
      const matchesDate = filterDate ? c.class_date.startsWith(filterDate) : true;
      
      return isFuture && matchesDate && c.available_capacity > 0;
    })
    .sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime());

  const handleRegister = async () => {
    if (!selectedStudent || !selectedClass) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          student_id: selectedStudent.id, 
          class_id: selectedClass.id 
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Clase asignada a ${selectedStudent.user.full_name}`, 'success');
        setSelectedClass(null);
        setSelectedStudent(null);
        setIsConfirmOpen(false);
        loadData(); 
      } else {
        showToast(data.message || 'Error al asignar', 'error');
        setIsConfirmOpen(false);
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando panel de reservas...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Reserva Manual</h1>
          <p className="text-gray-500 mt-1">Asigna clases manualmente (Ideal para fines de semana).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        
        {/* COLUMNA 1: SELECCIONAR ESTUDIANTE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Seleccionar Estudiante
          </h2>
          
          <div className="relative mb-4">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre o documento..." 
              className="w-full pl-10 p-3 border rounded-xl outline-none focus:border-black transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredStudents.map(student => (
              <div 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center
                  ${selectedStudent?.id === student.id 
                    ? 'border-black bg-zinc-50 ring-1 ring-black' 
                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
                `}
              >
                <div>
                  <p className="font-bold text-gray-900">{student.user?.full_name || 'Sin Nombre'}</p>
                  <p className="text-xs text-gray-500">
                    {student.user?.document_number || 'N/A'} • 
                    <span className="ml-1 text-indigo-600 font-bold">
                       {student.license_categories?.map((l:any) => l.name).join(', ') || '-'}
                    </span>
                  </p>
                </div>
                {selectedStudent?.id === student.id && <i className="bi bi-check-circle-fill text-black"></i>}
              </div>
            ))}
            {filteredStudents.length === 0 && (
               <p className="text-center text-gray-400 mt-10">No se encontraron estudiantes.</p>
            )}
          </div>
        </div>

        {/* COLUMNA 2: SELECCIONAR CLASE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Seleccionar Clase
            </h2>
            {/* NUEVO FILTRO DE FECHA */}
            <input 
               type="date"
               className="p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:border-black"
               value={filterDate}
               onChange={e => setFilterDate(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <i className="bi bi-calendar-x text-3xl text-gray-300 mb-2"></i>
                <p className="text-gray-400">No hay clases disponibles {filterDate ? 'para esta fecha' : ''}.</p>
              </div>
            ) : (
              filteredClasses.map(cls => {
                const date = new Date(cls.class_date);
                const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

                return (
                  <div 
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-4
                      ${selectedClass?.id === cls.id 
                        ? 'border-black bg-zinc-50 ring-1 ring-black' 
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border 
                      ${isWeekend ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('es-CO', {month:'short', timeZone:'UTC'})}</span>
                      <span className="text-xl font-black">{date.toLocaleDateString('es-CO', {day:'numeric', timeZone:'UTC'})}</span>
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{cls.subject.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(cls.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZone:'UTC'})} - 
                        {cls.professor?.user?.full_name}
                      </p>
                    </div>

                    <div className="text-right">
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${cls.available_capacity < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                         {cls.available_capacity} cupos
                       </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* BARRA INFERIOR */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="hidden md:block">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {selectedStudent 
               ? <span className="text-black font-bold flex items-center gap-1"><i className="bi bi-person-check-fill"></i> {selectedStudent.user.full_name}</span> 
               : 'Seleccione estudiante'} 
            <span className="text-gray-300">|</span>
            {selectedClass 
               ? <span className="text-black font-bold flex items-center gap-1"><i className="bi bi-calendar-check-fill"></i> {selectedClass.subject.name}</span> 
               : 'Seleccione clase'}
          </p>
        </div>
        <button 
          disabled={!selectedStudent || !selectedClass}
          onClick={() => setIsConfirmOpen(true)}
          className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          Confirmar Asignación
        </button>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleRegister}
        title="Confirmar Reserva Manual"
        message={`¿Estás seguro de inscribir a ${selectedStudent?.user?.full_name} en la clase de ${selectedClass?.subject?.name}?`}
        type="info"
      />

    </div>
  );
}