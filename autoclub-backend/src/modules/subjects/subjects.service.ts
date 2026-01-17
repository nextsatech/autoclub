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
        // Aquí ocurre la magia de conectar con A2, B1, etc.
        categories: {
          connect: createSubjectDto.categoryIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: { categories: true }, // para ver si es de Moto o Carro
      orderBy: { name: 'asc' }
    });
  }

  // Opcional: Eliminar materia
  async remove(id: number) {
    return this.prisma.subject.delete({ where: { id } });
  }
}