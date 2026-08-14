import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VehiculesService } from './vehicules.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@ApiTags('Vehicules')
@Controller({ path: 'vehicules', version: '1' })
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  @ApiOperation({ summary: 'Enregistrer un véhicule pour un conducteur' })
  @ApiResponse({ status: 201, description: 'Véhicule créé' })
  @ApiResponse({ status: 409, description: 'Immatriculation déjà utilisée' })
  create(@Body() dto: CreateVehiculeDto) {
    return this.vehiculesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les véhicules, éventuellement filtrés par conducteur' })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur' })
  @ApiResponse({ status: 200, description: 'Liste des véhicules' })
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.vehiculesService.findAll(conducteurId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un véhicule" })
  @ApiParam({ name: 'id', description: 'Identifiant du véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule trouvé' })
  @ApiResponse({ status: 404, description: 'Véhicule introuvable' })
  findOne(@Param('id') id: string) {
    return this.vehiculesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiParam({ name: 'id', description: 'Identifiant du véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule mis à jour' })
  update(@Param('id') id: string, @Body() dto: UpdateVehiculeDto) {
    return this.vehiculesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiParam({ name: 'id', description: 'Identifiant du véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule supprimé' })
  remove(@Param('id') id: string) {
    return this.vehiculesService.remove(id);
  }
}
