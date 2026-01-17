import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator'; 

@Controller('subjects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('admin') // 2. Solo Admin puede crear
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  // @Roles('admin', 'student') <--que todos vean, no pongas nada
  findAll() {
    return this.subjectsService.findAll();
  }

  @Delete(':id')
  @Roles('admin') // 3. Solo Admin puede borrar
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}