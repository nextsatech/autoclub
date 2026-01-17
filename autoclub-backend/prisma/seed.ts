// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de datos...');

  // 1. Crear Roles (Upsert evita duplicados)
  const roleAdmin = await prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin', description: 'Administrador total' } });
  const roleProf = await prisma.role.upsert({ where: { name: 'professor' }, update: {}, create: { name: 'professor', description: 'Instructor' } });
  const roleStudent = await prisma.role.upsert({ where: { name: 'student' }, update: {}, create: { name: 'student', description: 'Estudiante' } });

  // 2. Crear Categorías Básicas (Para no arrancar en cero)
  const licenses = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (const lic of licenses) {
    await prisma.licenseCategory.upsert({
      where: { name: lic },
      update: {},
      create: { name: lic }
    });
  }
  console.log('✅ Categorías base creadas');

  // 3. Crear Usuario Admin
  const password = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@autoclub.com' },
    update: {},
    create: {
      email: 'admin@autoclub.com',
      password_hash: password,
      full_name: 'Administrador General',
      role_id: roleAdmin.id
    }
  });

  console.log('✅ Admin creado (admin@autoclub.com / admin123)');

  // NOTA: Si tenías un estudiante de prueba aquí abajo que fallaba,
  // bórralo o usa la sintaxis nueva:
  /*
  await prisma.student.create({
    data: {
      user: { ... },
      license_categories: {
        connect: [{ name: 'A2' }, { name: 'B1' }] // <--- ASÍ SE CONECTAN AHORA (Array)
      }
    }
  })
  */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });