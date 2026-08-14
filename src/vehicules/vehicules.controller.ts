import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Controller({ path: 'vehicules', version: '1' })
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  create(@Body() dto: CreateVehiculeDto) {
    return this.vehiculesService.create(dto);
  }

  @Get()
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.vehiculesService.findAll(conducteurId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehiculeDto) {
    return this.vehiculesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiculesService.remove(id);
  }
}
