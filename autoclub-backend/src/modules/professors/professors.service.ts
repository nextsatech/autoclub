import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; 

@Injectable()
export class ProfessorsService {
  constructor(private prisma: PrismaService) {}

 
  create(createProfessorDto: any) {
    return 'This action adds a new professor';
  }

  
  async findAll() {
    return this.prisma.professor.findMany({
      include: {
        user: true, 
      },
    });
  }

  findOne(id: number) {
    return this.prisma.professor.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  update(id: number, updateProfessorDto: any) {
    return `This action updates a #${id} professor`;
  }

  remove(id: number) {
    return `This action removes a #${id} professor`;
  }
}