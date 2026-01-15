import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Post()
  create(@Body() createProfessorDto: any) {
    return this.professorsService.create(createProfessorDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard) // Opcional: Solo usuarios logueados pueden ver la lista
  findAll() {
    return this.professorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professorsService.findOne(+id);
  }
}