// app/login/components/LoginCard.tsx
'use client';

import RotatingText from './RotatingText';

export default function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 w-full max-w-[90%] sm:max-w-md p-0 sm:p-4">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-900/20">
        
        {/* --- TEXTO DINÁMICO (Título) --- */}
        <div className="mb-8 mt-2 text-center">
          <h2 className="text-zinc-400 text-xs sm:text-sm mb-3 font-medium uppercase tracking-widest">
            BIENVENIDO A
          </h2>
          
          <div className="flex justify-center items-center h-12">
             <RotatingText
                texts={['AutoClub', 'Tu Campus']}
                mainClassName="px-3 sm:px-6 bg-yellow-400 text-black font-black text-2xl sm:text-3xl overflow-hidden py-1 sm:py-2 justify-center rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.5)] transform -rotate-1"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
              />
          </div>
        </div>

        {/* Formulario inyectado */}
        {children}

      </div>
    </div>
  );
}