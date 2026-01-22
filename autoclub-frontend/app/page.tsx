import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige automáticamente al entrar a la raíz "/"
  redirect('/login');
}