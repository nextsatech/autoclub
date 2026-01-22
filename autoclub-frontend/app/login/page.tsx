// app/login/page.tsx - IMPROVED VERSION
import OrbBackground from './components/OrbBackground';
import LoginCard from './components/LoginCard';
import LoginForm from './components/LoginForm';
import FooterDev from './components/FooterDev';
import LoginSidebar from './components/LoginSidebar';
import FloatingParticles from './components/FloatingParticles';

export default function LoginPage() {
  return (
    <main className="relative min-h-[100dvh] w-full bg-black overflow-hidden font-sans flex items-center justify-center">
      
      {/* 1. ANIMATED BACKGROUND LAYERS */}
      <OrbBackground />
      <FloatingParticles />
      
      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: SIDEBAR (Hidden on mobile, visible on lg+) */}
          <LoginSidebar />
          
          {/* RIGHT: LOGIN CARD + FORM */}
          <div className="flex flex-col items-center gap-6">
            <LoginCard>
              <LoginForm />
            </LoginCard>
            
            <FooterDev />
          </div>
          
        </div>
      </div>

    </main>
  );
}