'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/app/config/api';
import { useToast } from '@/app/context/ToastContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    document_type: 'CC',
    document_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
        router.push('/login');
      } else {
        showToast(data.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      
      {/* SECCIÓN IZQUIERDA: IMAGEN Y LOGO (Visible en escritorio) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#2c3333] items-center justify-center p-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('/circuito.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/60" />
        
        <div className="relative z-10 w-full max-w-xl text-center">
          <img src="/logo.png" alt="AutoClub" className="w-full h-auto drop-shadow-2xl mb-6 animate-in fade-in zoom-in duration-1000" />
          <h2 className="text-3xl font-bold text-white drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Tu camino hacia la libertad <br />
            <span className="text-cyan-400 font-black">empieza aquí</span>
          </h2>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-zinc-50/50">
        
        {/* Logo Móvil */}
        <div className="lg:hidden mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <img src="/logo.png" alt="AutoClub" className="h-16 w-auto mx-auto" />
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-2">Registro de Estudiantes</p>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 lg:p-10 border border-white">
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Crea tu cuenta</h1>
              <p className="text-zinc-500 text-sm mt-2 font-medium">Completa tus datos para unirte a la plataforma</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                    <i className="bi bi-person-badge-fill"></i>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-zinc-100/50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold"
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
              </div>

              {/* Documento (Tipo y Número) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider ml-1">Tipo</label>
                  <select
                    className="w-full py-3.5 px-3 rounded-2xl bg-zinc-100/50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                    onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                  >
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider ml-1">Número de Documento</label>
                  <input
                    type="text"
                    required
                    placeholder="12345678"
                    className="w-full py-3.5 px-4 rounded-2xl bg-zinc-100/50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold"
                    onChange={(e) => setFormData({...formData, document_number: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                    <i className="bi bi-envelope-at-fill"></i>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="estudiante@ejemplo.com"
                    className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-zinc-100/50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider ml-1">Contraseña</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full py-3.5 pl-11 pr-12 rounded-2xl bg-zinc-100/50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-indigo-600"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-zinc-900 hover:bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all transform active:scale-[0.98] shadow-xl shadow-zinc-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Crear mi cuenta'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-zinc-500 text-sm font-medium">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Footer branding */}
          <div className="mt-8 flex justify-center opacity-50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                <span>Nextsa</span>
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                <span>Tech</span>
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                <span>AutoClub 2026</span>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}