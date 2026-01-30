'use client';

export default function LoginBackground() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#2c3333]">
      
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/circuito.jpg')` }}
      >
        <div className="absolute inset-0 bg-slate-800/80 lg:bg-slate-800/60 backdrop-grayscale-[0.5] backdrop-brightness-75"></div>
      </div>

      {/* Panel Blanco (Solo escritorio) */}
      <div className="absolute inset-y-0 left-0 z-10 hidden lg:block lg:w-[40%] bg-white shadow-2xl" />

      {/* LOGO + ESLOGAN ESCRITORIO */}
      {/* Ajusté 'top-12' a 'top-16' para centrarlo mejor visualmente si es necesario, 
          pero mantuve el contenedor flex para pegar el texto */}
      <div className="hidden lg:flex absolute top-12 left-[40%] w-[60%] z-20 flex-col items-center justify-start px-8">
        
        <img
          src="/logo.png"
          alt="AutoClub Bogotá"
          className="w-full h-auto drop-shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in duration-1000"
          style={{ maxWidth: '600px' }}
        />
        
       
        <h2 className="mt-1 text-center text-2xl font-medium tracking-wide max-w-xl animate-in slide-in-from-bottom-4 duration-1000 delay-300">
          {/* Parte 1: Texto base con efecto cristal ahumado (Blanco -> Transparente) */}
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/60 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Organiza tus clases teóricas y de taller de forma{' '}
          </span>
          
          {/* Parte 2: Palabras clave con efecto NEÓN/GLASS AZUL */}
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            fácil y ágil
          </span>
        </h2>
        
      </div>

    </div>
  );
}