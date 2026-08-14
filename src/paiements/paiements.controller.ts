import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@ApiTags('Paiements')
@Controller({ path: 'paiements', version: '1' })
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post()
  @ApiOperation({ summary: 'Initier un paiement mobile money (MTN MoMo / Orange Money)' })
  @ApiResponse({ status: 201, description: 'Paiement initié auprès du provider' })
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementsService.create(dto);
  }

  @Post('webhook/:referenceExterne/:statut')
  @ApiOperation({
    summary: 'Webhook de confirmation MTN MoMo / Orange Money',
    description:
      "Appelé par le provider mobile money. NB : à sécuriser par vérification de signature avant mise en production.",
  })
  @ApiParam({ name: 'referenceExterne', description: 'Référence de paiement générée à la création' })
  @ApiParam({ name: 'statut', enum: ['REUSSI', 'ECHOUE'] })
  @ApiResponse({ status: 201, description: 'Statut du paiement mis à jour' })
  @ApiResponse({ status: 400, description: 'Référence de paiement inconnue' })
  webhook(@Param('referenceExterne') referenceExterne: string, @Param('statut') statut: 'REUSSI' | 'ECHOUE') {
    return this.paiementsService.confirmerParWebhook(referenceExterne, statut);
  }

  @Get('abonnement/:abonnementId')
  @ApiOperation({ summary: "Historique des paiements d'un abonnement" })
  @ApiParam({ name: 'abonnementId', description: "Identifiant de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Liste des paiements' })
  parAbonnement(@Param('abonnementId') abonnementId: string) {
    return this.paiementsService.findByAbonnement(abonnementId);
  }
}
