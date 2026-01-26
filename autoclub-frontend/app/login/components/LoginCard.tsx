'use client';

import { motion } from 'framer-motion';
import RotatingText from './RotatingText';

export default function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative z-10 w-full max-w-[90%] sm:max-w-md"
    >
      

      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-yellow-500/20 blur-3xl -z-10 rounded-3xl"></div>
      
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-900/30 relative overflow-hidden">
        

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-size-200 animate-gradient"></div>
        
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent blur-2xl rounded-full"></div>
        
        
        <motion.div 
          className="mb-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          
          
        </motion.div>

        
        <div className="mb-8 text-center">
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-400 text-xs sm:text-sm mb-3 font-medium uppercase tracking-widest"
          >
            BIENVENIDO A
          </motion.h2>
          
          <div className="flex justify-center items-center h-12">
            <RotatingText
              texts={['AutoClub', 'Tu Campus', 'PlatForm']}
              mainClassName="px-3 sm:px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-2xl sm:text-3xl overflow-hidden py-1 sm:py-2 justify-center rounded-lg shadow-[0_0_20px_rgba(251,191,36,0.6)] transform -rotate-1 hover:rotate-0 transition-transform duration-300"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
          </div>
        </div>

        
        {children}

        
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <i className="bi bi-shield-check text-green-500"></i>
          <span>Conexión segura y encriptada</span>
        </div>

      </div>

      
      <style jsx>{`
        .bg-size-200 { background-size: 200% auto; }
        .animate-gradient { animation: gradient 3s linear infinite; }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  );
}