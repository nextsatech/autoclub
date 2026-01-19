import { Controller, Patch, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ModulesService } from './modules.service';


@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.modulesService.create({ name });
  }

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.modulesService.update(id, { name });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.remove(id);
  }
}