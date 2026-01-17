import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { AssignLicensesDto } from './dto/assign-licenses.dto';
import { AuthGuard } from '@nestjs/passport'; 
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Patch(':id/licenses')
  assignLicenses(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignLicensesDto,
  ) {
    return this.studentsService.assignLicenses(id, dto);
  }

  @Patch(':id') // PATCH /students/1
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }
}