import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@ApiTags('Évaluations')
@Controller({ path: 'evaluations', version: '1' })
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @ApiOperation({ summary: "Évaluer un trajet terminé (avis du passager : note, tags, commentaire)" })
  @ApiResponse({ status: 201, description: 'Évaluation créée' })
  @ApiResponse({ status: 400, description: 'Trajet en cours, ou passager ne correspondant pas au trajet' })
  @ApiResponse({ status: 404, description: 'Trajet introuvable' })
  @ApiResponse({ status: 409, description: 'Ce trajet a déjà été évalué' })
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les évaluations, éventuellement filtrées par passager ou conducteur' })
  @ApiQuery({ name: 'passagerId', required: false, description: "Filtrer par passager (auteur de l'avis)" })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur évalué' })
  @ApiResponse({ status: 200, description: 'Liste des évaluations' })
  findAll(@Query('passagerId') passagerId?: string, @Query('conducteurId') conducteurId?: string) {
    return this.evaluationsService.findAll(passagerId, conducteurId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Modifier une évaluation (note, tags, commentaire)" })
  @ApiParam({ name: 'id', description: "Identifiant de l'évaluation" })
  @ApiResponse({ status: 200, description: 'Évaluation mise à jour' })
  @ApiResponse({ status: 404, description: 'Évaluation introuvable' })
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.evaluationsService.update(id, dto);
  }

  @Get('trajet/:trajetId')
  @ApiOperation({ summary: "Évaluation d'un trajet donné" })
  @ApiParam({ name: 'trajetId', description: 'Identifiant du trajet' })
  @ApiResponse({ status: 200, description: 'Évaluation du trajet, ou null si pas encore notée' })
  parTrajet(@Param('trajetId') trajetId: string) {
    return this.evaluationsService.findByTrajet(trajetId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une évaluation" })
  @ApiParam({ name: 'id', description: "Identifiant de l'évaluation" })
  @ApiResponse({ status: 200, description: 'Évaluation trouvée' })
  @ApiResponse({ status: 404, description: 'Évaluation introuvable' })
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }
}
