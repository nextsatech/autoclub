// app/login/components/LoginSidebar.tsx - CON EFECTO SHINE
'use client';

import { motion } from 'framer-motion';

export default function LoginSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="hidden lg:flex flex-col gap-8 items-center justify-center"
    >
      
      {/* LOGO PRINCIPAL CON EFECTO SHINE */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect detrás del logo */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-yellow-500/30 blur-3xl scale-110"></div>
        
        {/* Logo container con efecto shine */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden group"
        >
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="AutoClub Bogotá"
            className="w-full h-auto relative z-10"
          />
          
          {/* EFECTO SHINE ANIMADO - Luz diagonal que recorre */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              initial={{ x: '-100%', y: '-100%' }}
              animate={{ 
                x: ['100%', '200%'],
                y: ['100%', '200%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
              className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
              style={{
                background: 'linear-gradient(135deg, transparent 30%, rgba(220, 38, 38, 0.3) 45%, rgba(251, 191, 36, 0.5) 50%, rgba(220, 38, 38, 0.3) 55%, transparent 70%)',
                transform: 'rotate(45deg)',
              }}
            />
          </div>

          {/* EFECTO SHINE AUTOMÁTICO (sin hover) - Más sutil */}
          <motion.div
            initial={{ x: '-200%', y: '-200%' }}
            animate={{ 
              x: ['200%'],
              y: ['200%']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "linear"
            }}
            className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 40%, rgba(251, 191, 36, 0.15) 48%, rgba(255, 255, 255, 0.3) 50%, rgba(220, 38, 38, 0.15) 52%, transparent 60%)',
              transform: 'rotate(45deg)',
            }}
          />

          {/* Borde brillante animado */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br from-red-500/50 via-yellow-500/50 to-red-500/50 bg-clip-border animate-gradient-rotate"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* ELEMENTOS DECORATIVOS ANIMADOS */}
      <div className="space-y-6 w-full max-w-md">
        
        {/* Decorative lines with icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          {/* Top line with icon */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50"
            >
              <i className="bi bi-mortarboard-fill text-yellow-400 text-xl"></i>
            </motion.div>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          {/* Center decorative element */}
          <div className="my-8 flex justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="w-16 h-16 border-2 border-yellow-500/30 rounded-full flex items-center justify-center"
            >
              <div className="w-12 h-12 border-2 border-red-500/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full"></div>
              </div>
            </motion.div>
          </div>

          {/* Bottom line with icon */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-l from-yellow-500/50 to-transparent"></div>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-900/50"
            >
              <i className="bi bi-car-front-fill text-black text-xl"></i>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating geometric shapes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative h-32 overflow-hidden"
        >
          {/* Shape 1 - Cuadrado rotado */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 left-8 w-16 h-16 border-2 border-red-500/20 rounded-2xl rotate-12"
          ></motion.div>

          {/* Shape 2 - Círculo flotante */}
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-8 right-12 w-12 h-12 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-full"
          ></motion.div>

          {/* Shape 3 - Rombo pequeño */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-4 left-20 w-8 h-8 border-2 border-yellow-500/30 rounded-lg rotate-45"
          ></motion.div>

          {/* Shape 4 - Punto pulsante */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="absolute top-12 right-4 w-6 h-6 bg-red-500/20 rounded-full"
          ></motion.div>
        </motion.div>

        {/* Info text - subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-2 mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-zinc-500 font-medium">Sistema activo</span>
          </div>
          
          <p className="text-zinc-600 text-xs max-w-xs mx-auto leading-relaxed">
            Plataforma educativa para estudiantes y directivos
          </p>
        </motion.div>

      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="w-full max-w-xs h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent rounded-full"
      ></motion.div>

      {/* CSS para la animación de gradiente del borde */}
      <style jsx>{`
        @keyframes gradient-rotate {
          0% { 
            background-position: 0% 50%;
            transform: rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
          }
          100% { 
            background-position: 0% 50%;
            transform: rotate(360deg);
          }
        }
        .animate-gradient-rotate {
          background-size: 200% 200%;
          animation: gradient-rotate 8s ease infinite;
        }
      `}</style>

    </motion.div>
  );
}