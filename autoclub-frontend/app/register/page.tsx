'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL } from '@/app/config/api'; // 👈 ¡ESTA LÍNEA FALTABA!

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    setError(''); // Limpiar errores previos
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
         method: 'POST',
         body: JSON.stringify(data),
         headers: { 'Content-Type': 'application/json' }
      });
  
      const result = await res.json();
  
      if (!res.ok) {
         // Si el backend dice que la cédula no está autorizada
         if (res.status === 403 || result.message.includes('cédula')) {
            setError('❌ Lo sentimos, tu cédula no aparece en la lista de admitidos. Acércate a la administración.');
         } else if (res.status === 409) {
            setError('⚠️ Esta cédula o correo ya están registrados.');
         } else {
            setError(`Error: ${result.message || 'No se pudo completar el registro'}`);
         }
      } else {
         setSuccess(true);
         // Redirigir después de 2 segundos
         setTimeout(() => {
            window.location.href = '/login?registered=true';
         }, 2000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md animate-in zoom-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-check-lg text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
          <p className="text-gray-500">Te estamos redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
           <h2 className="text-2xl font-black text-gray-900">Registro de Estudiantes</h2>
           <p className="text-sm text-gray-500 mt-2">Ingresa tus datos para activar tu cuenta</p>
        </div>
        
        {/* Campo Cédula - EL MÁS IMPORTANTE */}
        <div className="mb-4">
           <label className="block text-sm font-bold text-gray-700 mb-1">Número de Documento</label>
           <input 
             {...register('document_number', { required: true })} 
             className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
             placeholder="Ej: 1082..." 
           />
           {errors.document_number && <span className="text-red-500 text-xs mt-1">Este campo es obligatorio</span>}
        </div>

        {/* Tipo de Documento */}
        <div className="mb-4">
           <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Documento</label>
           <select 
             {...register('document_type', { required: true })}
             className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-black outline-none"
           >
             <option value="CC">Cédula de Ciudadanía</option>
             <option value="TI">Tarjeta de Identidad</option>
             <option value="CE">Cédula de Extranjería</option>
           </select>
        </div>

        {/* Nombre Completo */}
        <div className="mb-4">
           <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
           <input 
             {...register('full_name', { required: true })} 
             className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" 
             placeholder="Tu nombre real" 
           />
        </div>

        {/* Email */}
        <div className="mb-4">
           <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
           <input 
             type="email"
             {...register('email', { required: true })} 
             className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" 
             placeholder="correo@ejemplo.com" 
           />
        </div>

        {/* Contraseña */}
        <div className="mb-6">
           <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
           <input 
             type="password"
             {...register('password', { required: true, minLength: 6 })} 
             className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" 
             placeholder="******" 
           />
           {errors.password && <span className="text-red-500 text-xs mt-1">Mínimo 6 caracteres</span>}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
            <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5"></i>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-transform transform active:scale-[0.98] shadow-lg"
        >
          Registrarme
        </button>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-gray-500 hover:text-black hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </form>
    </div>
  );
}