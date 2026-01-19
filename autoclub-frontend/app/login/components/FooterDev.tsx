// app/login/components/FooterDev.tsx
'use client';

export default function FooterDev() {
  return (
    <div className="mt-8 flex justify-center relative z-20">
      <a 
        href="https://nextsatech.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-black/60 transition-all duration-300 backdrop-blur-sm"
      >
        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase group-hover:text-zinc-300 transition-colors">
          Dev by
        </span>
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-size-200 animate-gradient">
          Nextsa Tech
        </span>
        <i className="bi bi-box-arrow-up-right text-[10px] text-zinc-600 group-hover:text-yellow-500 transition-colors"></i>
      </a>
      
      {/* Estilos CSS Inline para la animación */}
      <style jsx>{`
        .bg-size-200 { background-size: 200% auto; }
        .animate-gradient { animation: gradient 3s linear infinite; }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}