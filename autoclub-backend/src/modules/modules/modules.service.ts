import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.module.create({ data: { name } });
  }

  findAll() {
    return this.prisma.module.findMany({ include: { subjects: true } });
  }

  remove(id: number) {
    return this.prisma.module.delete({ where: { id } });
  }
}