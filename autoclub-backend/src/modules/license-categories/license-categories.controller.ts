import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LicenseCategoriesService } from './license-categories.service';
import { CreateLicenseCategoryDto } from './dto/create-license-category.dto';
import { AuthGuard } from '@nestjs/passport'; // Opcional si quieres seguridad

@Controller('license-categories')
export class LicenseCategoriesController {
  constructor(private readonly service: LicenseCategoriesService) {}

  @Post()
  create(@Body() dto: CreateLicenseCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}