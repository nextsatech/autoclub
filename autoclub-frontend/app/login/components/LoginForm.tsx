// app/login/components/LoginForm.tsx - IMPROVED VERSION
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginResponse {
  access_token: string;
  user: {
    role: {
      name: string;
    };
    name: string;
  };
}

export default function LoginForm() {
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
      // Use environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (res.ok) {
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (data.user.role.name === 'admin') {
          router.push('/dashboard/admin/schedules');
        } else if (data.user.role.name === 'student') {
          router.push('/dashboard/student/schedule');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        setLoading(false);
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/573000000000?text=Hola,%20necesito%20ayuda%20con%20la%20plataforma%20AutoClub.', '_blank');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      
      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3"
          >
            <i className="bi bi-exclamation-triangle-fill text-red-500 text-lg mt-0.5"></i>
            <div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-400 transition-colors"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            disabled={loading}
            className="w-full bg-black/50 text-white border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all text-sm font-medium placeholder:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="usuario@autoclub.com"
          />
        </div>
      </div>

      {/* INPUT PASSWORD */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Contraseña
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-yellow-500 transition-colors">
            <i className="bi bi-lock-fill text-lg"></i>
          </div>
          
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-black/50 text-white border border-zinc-700 rounded-xl py-3.5 pl-12 pr-10 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm font-medium placeholder:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors focus:outline-none disabled:opacity-50"
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* FORGOT PASSWORD LINK */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors font-medium"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="pt-2 space-y-3">
        {/* Login Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/30 transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <i className="bi bi-arrow-repeat text-lg"></i>
              </motion.div>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              <span>Iniciar Sesión</span>
              <i className="bi bi-arrow-right-circle-fill"></i>
            </>
          )}
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </motion.button>

        {/* WhatsApp Support */}
        <motion.button
          type="button"
          onClick={handleWhatsAppSupport}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl border border-zinc-700 hover:border-green-500/50 transition-all text-xs flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <motion.i
            className="bi bi-whatsapp text-green-500"
            whileHover={{ scale: 1.2, rotate: 5 }}
          ></motion.i>
          Contactar Soporte
        </motion.button>
      </div>

 

    </form>
  );
}