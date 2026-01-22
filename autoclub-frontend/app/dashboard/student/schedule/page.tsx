'use client';

import { useEffect, useState } from 'react';
import ClassDetailModal from './components/ClassDetailModal';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleGrid from './components/ScheduleGrid';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal'; // 1. Importar Modal

import { API_URL } from '@/app/config/api';

export default function StudentSchedulePage() {
  const { showToast } = useToast();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  
  // Estados para selección y modales
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false); // 2. Estado para el modal de confirmación
  
  const [loading, setLoading] = useState(true);
  const [studentLicenses, setStudentLicenses] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>(''); 

  // --- CARGA DE DATOS INICIALES ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || ''); 
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
    fetchWeeks();
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
  
  // Paso 1: Abrir modal de confirmación (se llama desde ClassDetailModal)
  const handleReserveClick = () => {
    if (!selectedClass) return;
    setShowConfirm(true);
  };

  // Paso 2: Ejecutar la reserva (se llama desde ConfirmModal)
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
        
        // Cerrar modales y recargar
        setSelectedClass(null); 
        setShowConfirm(false);
        fetchClasses(); // Recargar la grilla para actualizar cupos
      } else {
        // CORREGIDO: Usar 'error' para mensajes de fallo
        showToast(`No se pudo reservar: ${data.message}`, 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    }
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

      {/* Alerta si no tiene licencias cargadas */}
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
          onClassClick={setSelectedClass}
        />
      )}

      {/* DETALLE DE CLASE */}
      {selectedClass && (
        <ClassDetailModal 
          cls={selectedClass} 
          onClose={() => setSelectedClass(null)} 
          onReserve={handleReserveClick} // Ahora abre el confirm
        />
      )}

      {/* CONFIRMACIÓN DE RESERVA */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeReservation}
        title="Confirmar Reserva"
        message={`¿Deseas reservar tu cupo para la clase de ${selectedClass?.subject?.name}?`}
        type="info" // Usamos 'info' (azul) porque es una acción positiva
      />

    </div>
  );
}