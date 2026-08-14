import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DemandePaiementMobileMoney {
  telephone: string;
  montant: number;
  devise: string;
  reference: string;
}

export interface ResultatPaiementMobileMoney {
  statut: 'REUSSI' | 'ECHOUE' | 'EN_ATTENTE';
  referenceExterne: string;
}

/**
 * Intégration MTN Mobile Money (Collections API).
 * Squelette : les identifiants sandbox/prod se configurent via .env
 * (MOMO_API_KEY, MOMO_API_USER, MOMO_SUBSCRIPTION_KEY, MOMO_TARGET_ENV).
 * À brancher sur le SDK/API MTN MoMo réel avant mise en production.
 */
@Injectable()
export class MomoProvider {
  private readonly logger = new Logger(MomoProvider.name);

  constructor(private readonly config: ConfigService) {}

  async demanderPaiement(demande: DemandePaiementMobileMoney): Promise<ResultatPaiementMobileMoney> {
    const env = this.config.get<string>('momo.targetEnv');
    this.logger.log(
      `[MoMo:${env}] Demande de paiement de ${demande.montant} ${demande.devise} vers ${demande.telephone}`,
    );
    // TODO: appel réel POST /collection/v1_0/requesttopay avec les headers
    // Ocp-Apim-Subscription-Key / X-Reference-Id / Authorization Bearer.
    return { statut: 'EN_ATTENTE', referenceExterne: demande.reference };
  }
}
