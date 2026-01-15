'use client';

import { Tilt } from 'react-tilt';

export default function VisualSide() {
  const tiltOptions = {
    max: 10,
    perspective: 1000,
    scale: 1.05,
    speed: 500,
    glare: true,
    "max-glare": 0.2,
  };

  return (
    <div className="relative w-full md:w-1/2 bg-gradient-to-br from-indigo-900/40 to-black p-10 flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-white/5">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative z-10 text-indigo-400 font-medium tracking-[0.2em] text-xs uppercase">
        Sistema de Gestión Integral
      </div>

      <Tilt options={tiltOptions} className="relative z-10 w-full flex justify-center py-10">
        <div className="w-48 h-48 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center border border-white/10 group cursor-default">
           <i className="bi bi-person-workspace text-7xl text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500"></i>
        </div>
      </Tilt>

      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">AutoClub</h1>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
          La excelencia empieza antes de encender el motor. Bienvenido a tu panel de control.
        </p>
      </div>
    </div>
  );
}