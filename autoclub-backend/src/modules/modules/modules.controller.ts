import { Controller, Patch, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { AuthGuard } from '@nestjs/passport'; // <--- Importar
import { RolesGuard } from '../auth/roles.guard'; // <--- Importar
import { Roles } from '../auth/roles.decorator'; // <--- Importar

@Controller('modules')
@UseGuards(AuthGuard('jwt'), RolesGuard) // <--- Proteger todo el controlador
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles('admin') // Solo admins crean
  create(@Body('name') name: string) {
    return this.modulesService.create({ name });
  }

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Patch(':id')
  @Roles('admin') // Solo admins editan
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.modulesService.update(id, { name });
  }

  @Delete(':id')
  @Roles('admin') // Solo admins borran
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.remove(id);
  }
}