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
    return this.prisma.student.findMany({
      include: {
        user: true, 
        license_categories: true 
      },
      orderBy: { id: 'asc' }
    });
  }

  async create(dto: CreateStudentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('El email ya está registrado');

    const role = await this.prisma.role.findUnique({ where: { id: dto.role_id } });
    if (!role) throw new BadRequestException('El rol seleccionado no existe');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          full_name: dto.full_name,
          document_type: dto.document_type,
          document_number: dto.document_number,
          role_id: dto.role_id 
        }
      });

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
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    const { password, categoryIds, ...userData } = dto;
    const userUpdateInput: any = { ...userData };

    if (password && password.trim() !== '') {
      userUpdateInput.password_hash = await bcrypt.hash(password, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateInput).length > 0) {
        await tx.user.update({
          where: { id: student.user_id },
          data: userUpdateInput
        });
      }

      if (categoryIds) {
        await tx.student.update({
          where: { id },
          data: {
            license_categories: {
              set: [], 
              connect: categoryIds.map(catId => ({ id: catId })) 
            }
          }
        });
      }

      return tx.student.findUnique({
        where: { id },
        include: { user: true, license_categories: true }
      });
    });
  }
}