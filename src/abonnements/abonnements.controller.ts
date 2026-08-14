import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbonnementsService } from './abonnements.service';
import { CreateAbonnementDto } from './dto/create-abonnement.dto';

@ApiTags('Abonnements')
@Controller({ path: 'abonnements', version: '1' })
export class AbonnementsController {
  constructor(private readonly abonnementsService: AbonnementsService) {}

  @Post()
  @ApiOperation({ summary: "Souscrire un conducteur à un plan" })
  @ApiResponse({ status: 201, description: 'Abonnement créé' })
  @ApiResponse({ status: 404, description: 'Plan introuvable' })
  create(@Body() dto: CreateAbonnementDto) {
    return this.abonnementsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les abonnements, éventuellement filtrés par conducteur' })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur' })
  @ApiResponse({ status: 200, description: 'Liste des abonnements' })
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.abonnementsService.findAll(conducteurId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un abonnement (avec ses paiements)' })
  @ApiParam({ name: 'id', description: 'Identifiant de l\'abonnement' })
  @ApiResponse({ status: 200, description: 'Abonnement trouvé' })
  @ApiResponse({ status: 404, description: 'Abonnement introuvable' })
  findOne(@Param('id') id: string) {
    return this.abonnementsService.findOne(id);
  }

  @Patch(':id/suspendre')
  @ApiOperation({ summary: 'Suspendre un abonnement' })
  @ApiParam({ name: 'id', description: 'Identifiant de l\'abonnement' })
  @ApiResponse({ status: 200, description: 'Abonnement suspendu' })
  suspendre(@Param('id') id: string) {
    return this.abonnementsService.suspendre(id);
  }
}
