import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  create(createModuleDto: CreateModuleDto) {
    return this.prisma.module.create({
      data: createModuleDto,
    });
  }


  findAll() {
    return this.prisma.module.findMany({
      include: {
        subjects: {
          include: {
            categories: true 
          }
        }
      }
    });
  }


  findOne(id: number) {
    return this.prisma.module.findUnique({
      where: { id },
      include: {
        subjects: {
          include: { categories: true }
        }
      }
    });
  }

  update(id: number, updateModuleDto: UpdateModuleDto) {
    return this.prisma.module.update({
      where: { id },
      data: updateModuleDto,
    });
  }

  remove(id: number) {
    return this.prisma.module.delete({
      where: { id },
    });
  }
}