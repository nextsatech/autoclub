import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLicenseCategoryDto } from './dto/create-license-category.dto';

@Injectable()
export class LicenseCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLicenseCategoryDto) {
    return this.prisma.licenseCategory.create({
      data: { name: dto.name }
    });
  }

  findAll() {
    return this.prisma.licenseCategory.findMany({
      include: { _count: { select: { students: true, subjects: true } } }
    });
  }

  remove(id: number) {
    return this.prisma.licenseCategory.delete({ where: { id } });
  }
}