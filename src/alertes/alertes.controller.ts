import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { DeclencherUrgenceDto } from './dto/declencher-urgence.dto';
import { UpdateStatutAlerteDto } from './dto/update-statut-alerte.dto';

@Controller({ path: 'alertes', version: '1' })
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Post('urgence')
  declencherUrgence(@Body() dto: DeclencherUrgenceDto) {
    return this.alertesService.creerUrgence(dto);
  }

  @Get()
  findAll(@Query('statut') statut?: string) {
    return this.alertesService.findAll(statut);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body() dto: UpdateStatutAlerteDto) {
    return this.alertesService.updateStatut(id, dto);
  }
}
