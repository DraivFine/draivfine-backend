import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrajetsService } from './trajets.service';
import { DemarrerTrajetDto } from './dto/demarrer-trajet.dto';
import { TerminerTrajetDto } from './dto/terminer-trajet.dto';

@ApiTags('Trajets')
@Controller({ path: 'trajets', version: '1' })
export class TrajetsController {
  constructor(private readonly trajetsService: TrajetsService) {}

  @Post('demarrer')
  @ApiOperation({ summary: 'Démarrer un trajet' })
  @ApiResponse({ status: 201, description: 'Trajet créé, en cours' })
  demarrer(@Body() dto: DemarrerTrajetDto) {
    return this.trajetsService.demarrer(dto);
  }

  @Patch(':id/terminer')
  @ApiOperation({
    summary: 'Terminer un trajet',
    description:
      "Répond immédiatement puis pousse un job dans la queue de scoring (le score est calculé en tâche de fond).",
  })
  @ApiParam({ name: 'id', description: 'Identifiant du trajet' })
  @ApiResponse({ status: 200, description: 'Trajet terminé, calcul du score lancé en tâche de fond' })
  @ApiResponse({ status: 400, description: 'Ce trajet est déjà terminé' })
  @ApiResponse({ status: 404, description: 'Trajet introuvable' })
  terminer(@Param('id') id: string, @Body() dto: TerminerTrajetDto) {
    return this.trajetsService.terminer(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les trajets (100 plus récents), éventuellement filtrés par conducteur' })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur' })
  @ApiResponse({ status: 200, description: 'Liste des trajets' })
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.trajetsService.findAll(conducteurId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un trajet (score, alertes, véhicule, conducteur)" })
  @ApiParam({ name: 'id', description: 'Identifiant du trajet' })
  @ApiResponse({ status: 200, description: 'Trajet trouvé' })
  @ApiResponse({ status: 404, description: 'Trajet introuvable' })
  findOne(@Param('id') id: string) {
    return this.trajetsService.findOne(id);
  }
}
