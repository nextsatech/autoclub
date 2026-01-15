import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @UseGuards(AuthGuard('jwt')) // <--- ¡CANDADO DE SEGURIDAD!
  @Post()
  create(@Body() createClassDto: CreateClassDto, @Request() req) {
    // Aquí podríamos validar si req.user.role === 'ADMIN'
    return this.classesService.create(createClassDto);
  }
}