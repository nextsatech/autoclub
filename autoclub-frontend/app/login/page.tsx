import LoginBackground from './components/LoginBackground';
import LoginFormCard from './components/LoginFormCard';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-white">
      
      <LoginBackground />

      <div className="relative z-30 w-full lg:w-[40%] min-h-screen flex flex-col items-center justify-center p-6 lg:p-12">
        
        {/* LOGO + ESLOGAN MÓVIL */}
        <div className="lg:hidden w-full flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-1000">
          <img
            src="/logo.png"
            alt="AutoClub Bogotá"
            className="w-full h-auto drop-shadow-xl"
            style={{ maxWidth: '200px' }}
          />
          
          {/* 👇 CAMBIO: mt-2 (Más pegado) y efecto brillante */}
          <p className="mt-2 text-center text-sm font-bold max-w-[280px] leading-relaxed animate-in slide-in-from-bottom-2 duration-1000 delay-200 bg-gradient-to-br from-zinc-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
            Organiza tus clases teóricas y de taller de forma fácil y ágil
          </p>
        </div>

        <div className="w-full max-w-md">
          <LoginFormCard />
        </div>
      </div>

    </main>
  );
}