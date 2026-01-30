'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { API_URL } from '@/app/config/api';

interface LoginResponse {
  access_token: string;
  user: {
    role: { name: string };
    name: string;
  };
}

export default function LoginFormCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role.name === 'admin') {
          router.push('/dashboard/admin/schedules');
        } else if (data.user.role.name === 'student') {
          router.push('/Registrar-clases');
        } else {
          router.push('/Panel-Principal');
        }
      } else {
        setError('Credenciales incorrectas');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-left-10 duration-1000">
      <div className="relative bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 border border-white/60">
        
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full"></div>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
            Bienvenido 
          </h1>
          <p className="text-gray-700 mt-3 text-sm font-medium opacity-80 uppercase tracking-wider">
            PlatForm Virtual
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold animate-in shake duration-300">
              <i className="bi bi-exclamation-circle-fill"></i>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.15em] ml-2">
              Correo Electrónico
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-900/40 group-focus-within:text-blue-600 transition-all duration-300">
                <i className="bi bi-envelope-at-fill text-lg"></i>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@autoclub.com"
                disabled={loading}
                className="w-full py-4 pl-14 pr-5 rounded-2xl bg-white/60 border border-white focus:bg-white text-gray-900 font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.03)] focus:shadow-[0_8px_20px_rgba(59,130,246,0.15)] focus:ring-0 outline-none transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.15em] ml-2">
              Contraseña
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-900/40 group-focus-within:text-blue-600 transition-all duration-300">
                <i className="bi bi-shield-lock-fill text-lg"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full py-4 pl-14 pr-14 rounded-2xl bg-white/60 border border-white focus:bg-white text-gray-900 font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.03)] focus:shadow-[0_8px_20px_rgba(59,130,246,0.15)] focus:ring-0 outline-none transition-all duration-300 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-lg`}></i>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors underline underline-offset-4 decoration-blue-700/30">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 rounded-2xl bg-gray-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_25px_rgba(0,0,0,0.1)] transform active:scale-[0.96] transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000 delay-500">
        <div className="h-px w-12 bg-gray-200"></div>
        <a 
          href="https://nextsatech.com/" 
          target="_blank" 
          className="group"
        >
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/80 shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Developed by</span>
            <div className="flex items-center">
              <span className="text-sm font-black text-gray-900">Nextsa</span>
              <span className="text-sm font-black text-blue-600 ml-1">Tech</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}