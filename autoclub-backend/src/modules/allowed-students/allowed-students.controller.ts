import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AllowedStudentsService } from './allowed-students.service';
import { CreateAllowedStudentDto } from './dto/create-allowed-student.dto';
import { UpdateAllowedStudentDto } from './dto/update-allowed-student.dto';

@Controller('allowed-students')
export class AllowedStudentsController {
  constructor(private readonly allowedStudentsService: AllowedStudentsService) {}

  @Post()
  create(@Body() createAllowedStudentDto: CreateAllowedStudentDto) {
    return this.allowedStudentsService.create(createAllowedStudentDto);
  }

  @Get()
  findAll() {
    return this.allowedStudentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allowedStudentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAllowedStudentDto: UpdateAllowedStudentDto) {
    return this.allowedStudentsService.update(+id, updateAllowedStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allowedStudentsService.remove(+id);
  }

  @Post('batch')
async createBatch(@Body() body: { data: any[] }) {
  return this.allowedStudentsService.createBatch(body.data);
}
}
