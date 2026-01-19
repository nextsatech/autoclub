import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: createSubjectDto.name,
        description: createSubjectDto.description,
        is_practical: createSubjectDto.is_practical || false,
        
        
        module: createSubjectDto.moduleId 
          ? { connect: { id: createSubjectDto.moduleId } } 
          : undefined, 
        // -----------------------

        categories: {
          connect: (createSubjectDto.categoryIds || []).map((id) => ({ id }))
        }
      },
      include: { categories: true, module: true }
    });
  }


  async findAll() {
    return this.prisma.subject.findMany({
      include: { categories: true, module: true }, 
      orderBy: { name: 'asc' }
    });
  }

  
  async update(id: number, updateData: any) {
    const { categoryIds, moduleId, ...rest } = updateData;

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...rest,
        // Actualizar Módulo (si es null, lo desconecta)
        module: moduleId 
          ? { connect: { id: Number(moduleId) } } 
          : { disconnect: true },
        
        // Actualizar Categorías (Reemplaza las existentes con 'set')
        categories: categoryIds 
          ? { set: categoryIds.map((cid: number) => ({ id: cid })) } 
          : undefined
      },
      include: { categories: true, module: true }
    });
  }
  
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar las clases asociadas a esta materia
      const classes = await tx.class.findMany({
        where: { subject_id: id },
        select: { id: true }
      });
      
      const classIds = classes.map(c => c.id);

      // 2. Si hay clases, eliminar primero sus dependencias (Reservas)
      if (classIds.length > 0) {
        // A. Eliminar Reservas de esas clases
        await tx.reservation.deleteMany({
          where: { class_id: { in: classIds } }
        });

        // B. Eliminar las Clases
        await tx.class.deleteMany({
          where: { id: { in: classIds } }
        });
      }

      // 3. Ahora sí, eliminar la Materia (ya está libre)
      return tx.subject.delete({
        where: { id }
      });
    });
  }
}