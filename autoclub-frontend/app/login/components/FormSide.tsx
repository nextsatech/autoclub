'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormSide() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center bg-zinc-950/50 text-center animate-in fade-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <i className="bi bi-check-lg text-4xl text-emerald-500"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white tracking-wider mb-2">ACCESO AUTORIZADO</h2>
        <p className="text-emerald-400 text-sm font-mono animate-pulse">Ingresando al campus...</p>
        
        <div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-full origin-left animate-[grow_2s_ease-out]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-zinc-950/50 transition-all duration-500">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-1">Iniciar Sesión</h2>
        <p className="text-zinc-500 text-sm">Ingresa tus credenciales para continuar.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border-l-2 border-red-500 text-red-200 text-sm p-3 rounded-r flex items-center gap-3 animate-[shake_0.5s_ease-in-out]">
            <i className="bi bi-exclamation-octagon-fill"></i>
            {error}
          </div>
        )}

        <div className="space-y-2 group">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Correo Electrónico</label>
          <div className="relative">
            <input
              type="email"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-4 pl-12 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="admin@autoclub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <i className="bi bi-envelope-fill absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"></i>
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-4 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i className="bi bi-lock-fill absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
               <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer select-none">
            <input type="checkbox" className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
            Recordarme
          </label>
          <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-semibold tracking-wide transition-all duration-300 mt-4 flex items-center justify-center gap-2
            ${loading 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
            }`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
              Verificando...
            </>
          ) : 'Ingresar al Portal'}
        </button>
      </form>

      <div className="mt-auto pt-10 text-center md:text-left">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Secured by NextSaTech Systems © 2026
        </p>
      </div>
    </div>
  );
}