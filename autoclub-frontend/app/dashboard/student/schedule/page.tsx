'use client';

import { useEffect, useState } from 'react';
import ClassDetailModal from './components/ClassDetailModal';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleGrid from './components/ScheduleGrid';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal'; 

import { API_URL } from '@/app/config/api';

export default function StudentSchedulePage() {
  const { showToast } = useToast();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  
  // Estados para selección y modales
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false); 
  
  const [loading, setLoading] = useState(true);
  const [studentLicenses, setStudentLicenses] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>(''); 
  
  // 👇 NUEVO: Estado para guardar los IDs de las materias ya reservadas
  const [reservedSubjectIds, setReservedSubjectIds] = useState<number[]>([]);

  // --- CARGA DE DATOS INICIALES ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let isStudent = false;

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || ''); 
      isStudent = user.role?.name === 'student';
      const licenses = user.student?.license_categories?.map((l: any) => Number(l.id)) || [];
      setStudentLicenses(licenses);
    }

    const fetchWeeks = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/schedules/active`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setWeeks(data);
          if (data.length > 0) setSelectedWeekId(data[0].id);
        }
      } catch (error) {
        showToast('Error cargando calendario', 'error');
      } finally {
        setLoading(false);
      }
    };

    // 👇 NUEVO: Función para buscar las materias que este estudiante ya tiene
    const fetchMyReservations = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/reservations/mine`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          // Extraemos solo el ID de la materia de cada reserva
          const subjectIds = data.map((r: any) => r.class.subject.id);
          setReservedSubjectIds(subjectIds);
        }
      } catch (e) { console.error("Error cargando reservas previas"); }
    };

    fetchWeeks();
    // Solo cargamos las reservas si el usuario es estudiante
    if (isStudent) fetchMyReservations(); 
  }, []);

  // --- CARGA DE CLASES DE LA SEMANA ---
  const fetchClasses = async () => {
    if (!selectedWeekId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/schedules/${selectedWeekId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCurrentWeekData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedWeekId]);


  // --- LÓGICA DE RESERVA ---
  
  const handleReserveClick = () => {
    if (!selectedClass) return;
    setShowConfirm(true);
  };

  const executeReservation = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class_id: selectedClass.id })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('¡Reserva exitosa! Te esperamos.', 'success');
        
        // 👇 NUEVO: Agregamos la materia recién reservada a la lista de "bloqueadas"
        setReservedSubjectIds(prev => [...prev, selectedClass.subject.id]);

        // Cerrar modales y recargar
        setSelectedClass(null); 
        setShowConfirm(false);
        fetchClasses(); 
      } else {
        showToast(`No se pudo reservar: ${data.message}`, 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  // 👇 NUEVO: Validador de clic para la grilla
  const handleClassSelection = (cls: any) => {
    // Si es estudiante y la materia ya está en su lista de reservas, bloqueamos.
    if (userRole === 'student' && reservedSubjectIds.includes(cls.subject.id)) {
      showToast(`Ya tienes una reserva o completaste la materia: ${cls.subject.name}`, 'error');
      return; // Detiene la ejecución, no se abre el modal
    }
    // Si pasa la validación, abrimos el modal normalmente
    setSelectedClass(cls);
  };

  const handleFixSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Cargando horario...</div>;

  return (
    <div className="p-4 md:p-10 space-y-8 animate-in fade-in max-w-[1800px] mx-auto relative">
      
      <ScheduleHeader 
        weeks={weeks} 
        selectedWeekId={selectedWeekId} 
        onWeekChange={setSelectedWeekId} 
      />

      {userRole === 'student' && studentLicenses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center gap-3 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill text-yellow-600 text-xl"></i>
          <div className="flex-1">
            <h4 className="font-bold text-yellow-800">Actualización de datos requerida</h4>
            <p className="text-sm text-yellow-700 mt-1">
              No se detectaron tus licencias. Por favor, vuelve a iniciar sesión para actualizar tus permisos.
            </p>
          </div>
          <button 
            onClick={handleFixSession}
            className="w-full md:w-auto mt-2 md:mt-0 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 transition-colors"
          >
            Re-conectar
          </button>
        </div>
      )}

      {currentWeekData && (
        <ScheduleGrid 
          currentWeekData={currentWeekData}
          userRole={userRole}
          studentLicenses={studentLicenses}
          onClassClick={handleClassSelection} // 👈 MODIFICADO: Usa la nueva función
        />
      )}

      {selectedClass && (
        <ClassDetailModal 
          cls={selectedClass} 
          onClose={() => setSelectedClass(null)} 
          onReserve={handleReserveClick} 
        />
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeReservation}
        title="Confirmar Reserva"
        message={`¿Deseas reservar tu cupo para la clase de ${selectedClass?.subject?.name}?`}
        type="info" 
      />

    </div>
  );
}