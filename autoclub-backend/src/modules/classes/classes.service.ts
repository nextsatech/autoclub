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

    // 2. Crear la clase en la base de datos
    return this.prisma.class.create({
      data: {
        title: createClassDto.title || 'Clase de Conducción',
        class_date: new Date(createClassDto.class_date),
        start_time: new Date(createClassDto.start_time),
        end_time: new Date(createClassDto.end_time),
        max_capacity: createClassDto.max_capacity,
        available_capacity: createClassDto.max_capacity, 
        professor_id: createClassDto.professor_id,
        status: 'OPEN',
      },
    });
  }
}