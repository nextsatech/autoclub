import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignLicensesDto } from './dto/assign-licenses.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ 
      include: {
        role: true,  
        student: { include: { license_categories: true } }, 
      },
      orderBy: { id: 'asc' }
    });
  }

  async create(dto: CreateStudentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('El email ya está registrado');

    // Verificar que el rol exista
    const role = await this.prisma.role.findUnique({ where: { id: dto.role_id } });
    if (!role) throw new BadRequestException('El rol seleccionado no existe');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // A. Crear el Usuario Base
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          full_name: dto.full_name,
          document_type: dto.document_type,
          document_number: dto.document_number,
          role_id: dto.role_id // Usamos el rol que viene del formulario
        }
      });

      // B. Lógica según el Rol
      if (role.name === 'student') {
        await tx.student.create({
          data: {
            user_id: newUser.id,
            license_categories: {
              connect: dto.categoryIds?.map((id) => ({ id })) || []
            }
          }
        });
      } else if (role.name === 'professor') {
        await tx.professor.create({
          data: { user_id: newUser.id }
        });
      }

      return newUser;
    });
  }

  async assignLicenses(studentId: number, dto: AssignLicensesDto) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        license_categories: {
          set: [],
          connect: dto.categoryIds.map((id) => ({ id }))
        }
      },
      include: { license_categories: true }
    });
  }

  async update(id: number, dto: UpdateStudentDto) {
    // Buscar estudiante y su usuario asociado
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    // Preparar datos para actualizar el Usuario (User)
    // Extraemos password y categoryIds para tratarlos aparte
    const { password, categoryIds, ...userData } = dto;
    
    // Objeto final para Prisma (User)
    const userUpdateInput: any = { ...userData };

    // Lógica de Contraseña: Solo si viene con texto, la hasheamos
    if (password && password.trim() !== '') {
      userUpdateInput.password_hash = await bcrypt.hash(password, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      // A. Actualizar datos del Usuario (Nombre, Email, Docs, Pass)
      // Solo si hay algo que actualizar
      if (Object.keys(userUpdateInput).length > 0) {
        await tx.user.update({
          where: { id: student.user_id },
          data: userUpdateInput
        });
      }

      // B. Actualizar Licencias (Student) solo si enviaron el array
      if (categoryIds) {
        await tx.student.update({
          where: { id },
          data: {
            license_categories: {
              set: [], // Limpiar anteriores
              connect: categoryIds.map(catId => ({ id: catId })) // Conectar nuevas
            }
          }
        });
      }

      // C. Devolver el estudiante actualizado
      return tx.student.findUnique({
        where: { id },
        include: { user: true, license_categories: true }
      });
    });
  }
}