import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'; // <--- AQUÍ FALTABA EL IMPORT
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      include: {
        role: true,
        student: { include: { license_categories: true } },
        professor: true,
      },
    });
  }

  async create(data: any) {
    // 1. Validar contraseña obligatoria
    if (!data.password) {
      throw new ConflictException('La contraseña es obligatoria para nuevos usuarios.');
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(data.password, salt);

    try {
      // 3. Transacción (Usuario + Perfil)
      return await this.prisma.$transaction(async (tx) => {
        
        // A. Crear Usuario Base
        const user = await tx.user.create({
          data: {
            full_name: data.full_name,
            email: data.email,
            document_number: data.document_number,
            password_hash,
            role_id: Number(data.role_id),
          }
        });

        // B. Buscar qué rol es para crear perfil
        const role = await tx.role.findUnique({ where: { id: Number(data.role_id) } });

        if (role?.name === 'student') {
          // Crear perfil Estudiante con licencias
          const categoryIds = data.license_category_ids?.map((cid: any) => ({ id: Number(cid) })) || [];
          await tx.student.create({
            data: {
              user_id: user.id,
              license_categories: { connect: categoryIds }
            }
          });
        } else if (role?.name === 'professor') {
          // Crear perfil Profesor
          await tx.professor.create({
            data: { user_id: user.id }
          });
        }

        return user;
      });

    } catch (error: any) {
      // Manejo de Duplicados
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target?.includes('email')) throw new ConflictException('El correo ya está registrado.');
        if (target?.includes('document_number')) throw new ConflictException('El documento ya está registrado.');
      }
      throw error;
    }
  }
  
  async update(id: number, data: any) {
    const updateData: any = {
      full_name: data.full_name,
      email: data.email,
      document_number: data.document_number,
      role_id: data.role_id ? Number(data.role_id) : undefined,
    };

    
    if (data.password && data.password.trim() !== '') {
      const salt = await bcrypt.genSalt();
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }

    try {
     
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: { student: true }
      });

     
      if (data.license_category_ids) {
        const categoryIds = data.license_category_ids.map((cid: any) => ({ id: Number(cid) }));

        if (user.student) {
          await this.prisma.student.update({
            where: { id: user.student.id },
            data: {
              license_categories: {
                set: [],
                connect: categoryIds
              }
            }
          });
        } else {
       
          await this.prisma.student.create({
            data: {
              user_id: user.id,
              license_categories: { connect: categoryIds }
            }
          });
        }
      }

      return user;

    } catch (error: any) {

      if (error.code === 'P2002') {
        const target = error.meta?.target;
        
        if (target && target.includes('email')) {
          throw new ConflictException('Ya existe un usuario con este Correo Electrónico.');
        }
        
        if (target && target.includes('document_number')) {
          throw new ConflictException('Ya existe un usuario con este Número de Documento.');
        }

        throw new ConflictException('Datos duplicados en el sistema.');
      }
      
      throw error;
    }
  }


  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, include: { student: true, professor: true } });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      if (user.student) {
        await tx.reservation.deleteMany({ where: { student_id: user.student.id } });
        await tx.student.delete({ where: { id: user.student.id } });
      }
      
      if (user.professor) {
    
        await tx.class.deleteMany({ where: { professor_id: user.professor.id } });
        await tx.professor.delete({ where: { id: user.professor.id } });
      }
      
      return tx.user.delete({ where: { id } });
    });
  }
}