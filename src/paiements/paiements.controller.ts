import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Controller({ path: 'paiements', version: '1' })
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post()
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementsService.create(dto);
  }

  @Post('webhook/:referenceExterne/:statut')
  webhook(@Param('referenceExterne') referenceExterne: string, @Param('statut') statut: 'REUSSI' | 'ECHOUE') {
    // NB: en production, valider la signature du webhook (MoMo/Orange)
    // avant de traiter la confirmation.
    return this.paiementsService.confirmerParWebhook(referenceExterne, statut);
  }

  @Get('abonnement/:abonnementId')
  parAbonnement(@Param('abonnementId') abonnementId: string) {
    return this.paiementsService.findByAbonnement(abonnementId);
  }
}
