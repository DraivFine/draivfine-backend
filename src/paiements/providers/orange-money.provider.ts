import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DemandePaiementMobileMoney, ResultatPaiementMobileMoney } from './momo.provider';

/**
 * Intégration Orange Money API. Squelette identique à MomoProvider —
 * identifiants via ORANGE_MONEY_CLIENT_ID / SECRET / MERCHANT_KEY.
 */
@Injectable()
export class OrangeMoneyProvider {
  private readonly logger = new Logger(OrangeMoneyProvider.name);

  constructor(private readonly config: ConfigService) {}

  async demanderPaiement(demande: DemandePaiementMobileMoney): Promise<ResultatPaiementMobileMoney> {
    this.logger.log(
      `[OrangeMoney] Demande de paiement de ${demande.montant} ${demande.devise} vers ${demande.telephone}`,
    );
    // TODO: appel réel à l'API Orange Money Web Payment / merchant.
    return { statut: 'EN_ATTENTE', referenceExterne: demande.reference };
  }
}
