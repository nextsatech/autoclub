// app/login/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role.name === 'admin') router.push('/dashboard/admin/schedules');
        else if (data.user.role.name === 'student') router.push('/dashboard/student/schedule');
        else router.push('/dashboard');
      } else {
        alert('Credenciales incorrectas');
        setLoading(false);
      }
    } catch (error) {
      alert('Error de conexión');
      setLoading(false);
    }
  };

  const handleWhatsAppSupport = () => {
    // Reemplaza con el número real
    window.open('https://wa.me/573000000000?text=Hola,%20necesito%20ayuda%20con%20la%20plataforma%20AutoClub.', '_blank');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      
      {/* INPUT EMAIL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Correo Electrónico
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
            <i className="bi bi-envelope-fill text-lg"></i>
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/50 text-white border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium placeholder:text-zinc-700"
            placeholder="usuario@autoclub.com"
          />
        </div>
      </div>

      {/* INPUT PASSWORD CON OJITO */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Contraseña
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-yellow-500 transition-colors">
            <i className="bi bi-lock-fill text-lg"></i>
          </div>
          
          <input
            type={showPassword ? "text" : "password"} // Cambio dinámico
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 text-white border border-zinc-700 rounded-xl py-3.5 pl-12 pr-10 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm font-medium placeholder:text-zinc-700"
            placeholder="••••••••"
          />

          {/* BOTÓN OJITO */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors focus:outline-none"
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-2 space-y-3">
        {/* Login */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/30 transition-all active:scale-[0.98] uppercase tracking-wider text-xs flex items-center justify-center gap-2"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'} 
          {!loading && <i className="bi bi-arrow-right-circle-fill"></i>}
        </button>

        {/* Soporte WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsAppSupport}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl border border-zinc-700 hover:border-green-500/50 transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-2 group"
        >
          <i className="bi bi-whatsapp text-green-500 group-hover:scale-110 transition-transform"></i>
          Contactar Soporte
        </button>
      </div>

    </form>
  );
}