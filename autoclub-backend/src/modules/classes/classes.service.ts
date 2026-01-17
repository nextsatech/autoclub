import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    // 1. Verificar que el profesor existe
    const professor = await this.prisma.professor.findUnique({
      where: { id: createClassDto.professor_id },
    });

    if (!professor) {
      throw new NotFoundException('El profesor especificado no existe');
    }

    // 2. Verificar que la materia existe
    const subject = await this.prisma.subject.findUnique({
        where: { id: createClassDto.subject_id }
    });
    
    if (!subject) {
        throw new NotFoundException('La materia especificada no existe');
    }

    // 3. Crear la clase en la base de datos

    return this.prisma.class.create({
      data: {
        subject_id: createClassDto.subject_id, 
        professor_id: createClassDto.professor_id,
        weekly_schedule_id: createClassDto.weekly_schedule_id,
        class_date: new Date(createClassDto.class_date),
        start_time: new Date(createClassDto.start_time),
        end_time: new Date(createClassDto.end_time),
        max_capacity: createClassDto.max_capacity,
        available_capacity: createClassDto.max_capacity, 
        
        status: 'OPEN',
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        professor: { include: { user: true } },
        subject: true // Importante para ver el nombre de la materia en el frontend
      },
      orderBy: { class_date: 'asc' }
    });
  }

  async findUnassignedInRange(startDate: Date, endDate: Date) {
    return this.prisma.class.findMany({
      where: {
        class_date: {
          gte: startDate,
          lte: endDate,
        },
        weekly_schedule_id: null, // Solo las que no tienen dueño
      },
      include: {
        subject: true,
        professor: { include: { user: true } }
      },
      orderBy: { class_date: 'asc' }
    });
  }

// También necesitamos un método para "Vincular" clases a una semana
  async assignToSchedule(classIds: number[], scheduleId: number) {
    return this.prisma.class.updateMany({
      where: {
        id: { in: classIds }
      },
      data: {
        weekly_schedule_id: scheduleId
      }
    });
  }

  // Y un método para "Desvincular" (sacar de la semana)
  async removeFromSchedule(classId: number) {
    return this.prisma.class.update({
      where: { id: classId },
      data: { weekly_schedule_id: null }
    });
  }

  async remove(id: number) {

    return this.prisma.$transaction(async (tx) => {
      

      await tx.reservation.deleteMany({
        where: { class_id: id }
      });


      return tx.class.delete({
        where: { id }
      });
    });
  }
}