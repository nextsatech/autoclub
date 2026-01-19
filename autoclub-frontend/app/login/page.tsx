// app/login/page.tsx
import OrbBackground from './components/OrbBackground';
import LoginCard from './components/LoginCard';
import LoginForm from './components/LoginForm';
import FooterDev from './components/FooterDev';

export default function LoginPage() {
  return (
    // 'min-h-[100dvh]' asegura que ocupe toda la pantalla en móviles (dvh evita el problema de la barra del navegador)
    <main className="relative min-h-[100dvh] w-full bg-black overflow-hidden font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* 1. FONDO ANIMADO */}
      <OrbBackground />

      {/* 2. TARJETA PRINCIPAL + FORMULARIO */}
      <LoginCard>
        <LoginForm />
      </LoginCard>

      {/* 3. CRÉDITOS */}
      <FooterDev />

    </main>
  );
}