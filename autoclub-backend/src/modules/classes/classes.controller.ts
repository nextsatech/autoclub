import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common'; 
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createClassDto: CreateClassDto, @Request() req) {
    return this.classesService.create(createClassDto);
  }

  
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
  return this.classesService.update(+id, updateClassDto);
}
}