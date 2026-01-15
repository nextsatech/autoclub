import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seed Completo...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Admin' },
  });

  const profRole = await prisma.role.upsert({
    where: { name: 'PROFESSOR' },
    update: {},
    create: { name: 'PROFESSOR', description: 'Profesor' },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: { name: 'STUDENT', description: 'Estudiante' },
  });

  const password = await bcrypt.hash('123456', 10);

  // 2. Admin
  await prisma.user.upsert({
    where: { email: 'admin@autoclub.com' },
    update: {},
    create: {
      email: 'admin@autoclub.com',
      full_name: 'Admin Principal',
      password_hash: password,
      role_id: adminRole.id,
    },
  });

  // 3. Profesor
  const teacherUser = await prisma.user.upsert({
    where: { email: 'profe@autoclub.com' },
    update: {},
    create: {
      email: 'profe@autoclub.com',
      full_name: 'Profesor de Prueba',
      password_hash: password,
      role_id: profRole.id,
    },
  });

  await prisma.professor.upsert({
    where: { user_id: teacherUser.id },
    update: {},
    create: { user_id: teacherUser.id },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'estudiante@autoclub.com' },
    update: {},
    create: {
      email: 'estudiante@autoclub.com',
      full_name: 'Pepito Estudiante',
      password_hash: password,
      role_id: studentRole.id,
    },
  });

  await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: { user_id: studentUser.id },
  });

  console.log('Base de datos lista con: Admin, Profe y Estudiante.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });