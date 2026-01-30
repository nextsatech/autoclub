import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/Panel-Principal',
        destination: '/dashboard'
      },
      {
        source: '/Malla-Curricular',
        destination: '/dashboard/student/curriculum'
      },

      {
        source: '/Registrar-clases', // Lo que ve el alumno
        destination: '/dashboard/student/schedule', // La ruta real
      },
      {
        source: '/mis-registros',
        destination: '/dashboard/student/reservations',
      },
    ];
  },
};

export default nextConfig;
