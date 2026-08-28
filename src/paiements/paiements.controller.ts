import { Body, Controller, Logger, Param, Post, Get } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { GetmepayWebhookPayload } from './getmepay/getmepay.types';

@ApiTags('Paiements')
@Controller({ path: 'paiements', version: '1' })
export class PaiementsController {
  private readonly logger = new Logger(PaiementsController.name);

  constructor(private readonly paiementsService: PaiementsService) {}

  @Post()
  @ApiOperation({ summary: 'Initier un paiement mobile money (MTN MoMo / Orange Money, via GetMePay)' })
  @ApiResponse({ status: 201, description: 'Paiement initié — statut EN_ATTENTE ou ECHOUE si GetMePay est injoignable' })
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementsService.create(dto);
  }

  @Post('webhook/getmepay')
  @ApiOperation({
    summary: 'Webhook de confirmation GetMePay',
    description:
      "Pas de vérification de signature côté GetMePay — la sécurité repose sur une recherche idempotente par référence et sur le fait de toujours répondre 200, y compris en cas d'erreur interne ou de référence inconnue, pour arrêter les tentatives de renvoi du fournisseur.",
  })
  @ApiResponse({ status: 200, description: 'Toujours 200, y compris sur référence inconnue/doublon' })
  async webhook(@Body() body: GetmepayWebhookPayload) {
    try {
      return await this.paiementsService.confirmerParWebhookGetmepay(body);
    } catch (err: any) {
      this.logger.error(`Erreur traitement webhook GetMePay : ${err.message}`);
      return { received: true };
    }
  }

  @Post(':id/verifier-statut')
  @ApiOperation({
    summary: 'Vérifier manuellement le statut auprès de GetMePay',
    description:
      "À utiliser quand le webhook n'est pas joignable (environnement local) : rejoue la même logique que le webhook, à partir des références GetMePay stockées lors de l'initiation.",
  })
  @ApiParam({ name: 'id', description: 'Identifiant du paiement' })
  @ApiResponse({ status: 200, description: 'Statut à jour' })
  @ApiResponse({ status: 400, description: "Paiement jamais initié auprès de GetMePay" })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  verifierStatut(@Param('id') id: string) {
    return this.paiementsService.verifierStatutManuel(id);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un paiement" })
  @ApiParam({ name: 'id', description: 'Identifiant du paiement' })
  @ApiResponse({ status: 200, description: 'Paiement trouvé' })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  findOne(@Param('id') id: string) {
    return this.paiementsService.findOne(id);
  }

  @Get('abonnement/:abonnementId')
  @ApiOperation({ summary: "Historique des paiements d'un abonnement" })
  @ApiParam({ name: 'abonnementId', description: "Identifiant de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Liste des paiements' })
  parAbonnement(@Param('abonnementId') abonnementId: string) {
    return this.paiementsService.findByAbonnement(abonnementId);
  }
}
