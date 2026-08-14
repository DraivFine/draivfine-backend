import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertesService } from './alertes.service';
import { DeclencherUrgenceDto } from './dto/declencher-urgence.dto';
import { UpdateStatutAlerteDto } from './dto/update-statut-alerte.dto';

@ApiTags('Alertes')
@Controller({ path: 'alertes', version: '1' })
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Post('urgence')
  @ApiOperation({
    summary: "Déclencher le bouton d'urgence",
    description:
      "Diffuse en parallèle (websocket, SMS aux contacts d'urgence, push au gestionnaire) sans attendre la confirmation d'un canal avant de déclencher les autres.",
  })
  @ApiResponse({ status: 201, description: 'Alerte urgence créée et diffusion lancée' })
  declencherUrgence(@Body() dto: DeclencherUrgenceDto) {
    return this.alertesService.creerUrgence(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les alertes, éventuellement filtrées par statut' })
  @ApiQuery({ name: 'statut', required: false, enum: ['NOUVELLE', 'EN_COURS', 'RESOLUE', 'IGNOREE'] })
  @ApiResponse({ status: 200, description: 'Liste des alertes (200 plus récentes)' })
  findAll(@Query('statut') statut?: string) {
    return this.alertesService.findAll(statut);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une alerte" })
  @ApiParam({ name: 'id', description: "Identifiant de l'alerte" })
  @ApiResponse({ status: 200, description: 'Alerte mise à jour' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable' })
  updateStatut(@Param('id') id: string, @Body() dto: UpdateStatutAlerteDto) {
    return this.alertesService.updateStatut(id, dto);
  }
}
