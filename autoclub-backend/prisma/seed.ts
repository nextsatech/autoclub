import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de Datos Maestros...');

  // 1. Crear Roles (EN INGLÉS)
  const roles = ['ADMIN', 'PROFESSOR', 'STUDENT'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // 2. Crear Categorías de Licencia
  const catA2 = await prisma.licenseCategory.upsert({ where: { name: 'A2' }, update: {}, create: { name: 'A2' } });
  const catB1 = await prisma.licenseCategory.upsert({ where: { name: 'B1' }, update: {}, create: { name: 'B1' } });
  const catC1 = await prisma.licenseCategory.upsert({ where: { name: 'C1' }, update: {}, create: { name: 'C1' } });

  // 3. Crear Materias
  const subjectsData = [
    { name: 'Ética, Prevención y Conflictos', codes: [catA2, catB1, catC1] },
    { name: 'Señalización de Tránsito', codes: [catA2, catB1, catC1] },
    { name: 'Normativa de Tránsito', codes: [catA2, catB1, catC1] },
    { name: 'Mecánica de Motocicleta', codes: [catA2] },
    { name: 'Desmonte de Rueda', codes: [catB1, catC1] },
  ];

  for (const subject of subjectsData) {
    const createdSubject = await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: { name: subject.name },
    });
    
    // Conectar categorías
    for (const cat of subject.codes) {
      await prisma.subject.update({
        where: { id: createdSubject.id },
        data: { categories: { connect: { id: cat.id } } }
      });
    }
  }

  // 4. Crear Usuario ADMIN
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@autoclub.com' },
    update: {},
    create: {
      email: 'admin@autoclub.com',
      full_name: 'Administrador Principal',
      password_hash: password,
      role: { connect: { name: 'ADMIN' } },
    },
  });

  // 5. Crear Usuario PROFESOR (CORREGIDO)
  const createdProfUser = await prisma.user.upsert({
    where: { email: 'profe@autoclub.com' },
    update: {},
    create: {
      email: 'profe@autoclub.com',
      full_name: 'Instructor Yamid Perilla', 
      password_hash: password,
      // 👇 AQUÍ ESTABA EL ERROR: Debe ser 'PROFESSOR' (inglés), no 'PROFESOR'
      role: { connect: { name: 'PROFESSOR' } }, 
    },
  });

  // Crear el perfil de Professor
  await prisma.professor.upsert({
    where: { user_id: createdProfUser.id },
    update: {},
    create: {
      user: { connect: { id: createdProfUser.id } }
    }
  });

  console.log('✅ Base de datos sembrada correctamente');

  // 6. Crear Usuario ESTUDIANTE (PRUEBA)
  const createdStudentUser = await prisma.user.upsert({
    where: { email: 'estudiante@autoclub.com' },
    update: {},
    create: {
      email: 'estudiante@autoclub.com',
      full_name: 'Pepito Estudiante',
      password_hash: password, // Usamos la misma 'admin123' por facilidad
      role: { connect: { name: 'STUDENT' } },
    },
  });

  // Crear perfil de Estudiante y asignarle Categoría A2 (Moto)
  // ¡OJO! Esto es vital para probar que NO vea clases de Carro
  await prisma.student.upsert({
    where: { user_id: createdStudentUser.id },
    update: {},
    create: {
      user: { connect: { id: createdStudentUser.id } },
      license_category: { connect: { name: 'A2' } } 
    }
  });

  console.log('✅ Estudiante creado: estudiante@autoclub.com (Categoría A2)');

}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });