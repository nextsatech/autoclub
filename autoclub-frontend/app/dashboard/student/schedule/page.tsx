'use client';

import { useEffect, useState } from 'react';
import ClassDetailModal from './components/ClassDetailModal';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleGrid from './components/ScheduleGrid';

const API_URL = 'http://localhost:3000';

export default function StudentSchedulePage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [studentLicenses, setStudentLicenses] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>(''); 

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
        console.error("Error cargando semanas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
  }, []);

  useEffect(() => {
    if (!selectedWeekId) return;
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/schedules/${selectedWeekId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCurrentWeekData(await res.json());
    };
    fetchClasses();
  }, [selectedWeekId]);

  const handleReserve = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('token');
    
    if(!confirm(`¿Confirmar reserva para: ${selectedClass.subject.name}?`)) return;

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class_id: selectedClass.id })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡Reserva exitosa!');
        setSelectedClass(null);
        // Recargar datos
        const currentWeek = selectedWeekId;
        setSelectedWeekId(''); 
        setTimeout(() => setSelectedWeekId(currentWeek), 10); 
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleFixSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando horario...</div>;

  return (
    <div className="p-4 md:p-10 space-y-8 animate-in fade-in max-w-[1800px] mx-auto">
      
      <ScheduleHeader 
        weeks={weeks} 
        selectedWeekId={selectedWeekId} 
        onWeekChange={setSelectedWeekId} 
      />

      {userRole === 'student' && studentLicenses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill text-yellow-600 text-xl"></i>
          <div className="flex-1">
            <h4 className="font-bold text-yellow-800">Actualización de datos requerida</h4>
            <p className="text-sm text-yellow-700 mt-1">
              No se detectaron tus licencias. Por favor, vuelve a iniciar sesión.
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

      {selectedClass && (
        <ClassDetailModal 
          cls={selectedClass} 
          onClose={() => setSelectedClass(null)} 
          onReserve={handleReserve}
        />
      )}

    </div>
  );
}