import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Paiement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetmepayService } from './getmepay/getmepay.service';
import { GetmepayWebhookPayload } from './getmepay/getmepay.types';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Injectable()
export class PaiementsService {
  private readonly logger = new Logger(PaiementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly getmepay: GetmepayService,
  ) {}

  async create(dto: CreatePaiementDto) {
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id: dto.abonnementId },
      include: { conducteur: { include: { utilisateur: true } } },
    });
    if (!abonnement) throw new NotFoundException('Abonnement introuvable');

    const paiement = await this.prisma.paiement.create({
      data: { abonnementId: dto.abonnementId, operateur: dto.operateur, montant: dto.montant },
    });

    // GetMePay mint ses propres références (transaction_reference /
    // soleaspay_reference) au retour du payin — contrairement à l'ancien
    // schéma MTN/Orange, on n'en pré-génère pas côté API.
    try {
      const resultat = await this.getmepay.payin({
        montant: dto.montant,
        telephone: dto.telephone,
        description: 'Abonnement DraivFine',
        customerName: abonnement.conducteur.utilisateur.nom,
        operateur: dto.operateur,
      });

      const paiementMisAJour = await this.prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          referenceExterne: resultat.transaction_reference,
          payReference: resultat.soleaspay_reference,
          statutFournisseur: resultat.status,
          montantArrondi: resultat.amount,
          statut: this.getmepay.mapStatutFournisseurToStatutPaiement(resultat.status),
        },
      });

      // payment_url n'est utile qu'à l'instant T (redirection checkout côté
      // client) — pas persisté en base, juste renvoyé en plus.
      return { ...paiementMisAJour, paymentUrl: resultat.payment_url };
    } catch (err: any) {
      this.logger.error(`Échec payin GetMePay pour paiement ${paiement.id} : ${err.message}`);
      return this.prisma.paiement.update({ where: { id: paiement.id }, data: { statut: 'ECHOUE' } });
    }
  }

  /** Webhook GetMePay — voir PaiementsController pour le contrat "toujours 200". */
  async confirmerParWebhookGetmepay(payload: GetmepayWebhookPayload) {
    if (!payload?.order_id) return { received: true, ignore: 'order_id manquant' };

    const paiement = await this.prisma.paiement.findFirst({ where: { referenceExterne: payload.order_id } });
    if (!paiement) {
      this.logger.warn(`Webhook GetMePay : référence inconnue ${payload.order_id}`);
      return { received: true, ignore: 'référence inconnue' };
    }

    if (paiement.statut === 'REUSSI' || paiement.statut === 'ECHOUE') {
      return { received: true, dejaTraite: true };
    }

    return this.appliquerStatutFournisseur(paiement, payload.status, payload.soleaspay_reference);
  }

  /** Repli local (webhook injoignable en dev) : interroge GetMePay directement et applique le même traitement que le webhook. */
  async verifierStatutManuel(id: string) {
    const paiement = await this.prisma.paiement.findUnique({ where: { id } });
    if (!paiement) throw new NotFoundException('Paiement introuvable');
    if (!paiement.referenceExterne || !paiement.payReference) {
      throw new BadRequestException('Paiement non initié auprès de GetMePay (payin en échec ou pas encore appelé)');
    }
    if (paiement.statut === 'REUSSI' || paiement.statut === 'ECHOUE') return paiement;

    const resultat = await this.getmepay.checkStatus(paiement.referenceExterne, paiement.payReference);
    return this.appliquerStatutFournisseur(paiement, resultat.status, paiement.payReference);
  }

  private async appliquerStatutFournisseur(paiement: Paiement, statutFournisseur: string, payReference?: string) {
    const statut = this.getmepay.mapStatutFournisseurToStatutPaiement(statutFournisseur);
    const paiementMisAJour = await this.prisma.paiement.update({
      where: { id: paiement.id },
      data: { statut, statutFournisseur, payReference: payReference ?? paiement.payReference },
    });

    if (statut === 'REUSSI') {
      await this.prisma.abonnement.update({ where: { id: paiement.abonnementId }, data: { statut: 'ACTIF' } });
    }

    return paiementMisAJour;
  }

  async findOne(id: string) {
    const paiement = await this.prisma.paiement.findUnique({ where: { id } });
    if (!paiement) throw new NotFoundException('Paiement introuvable');
    return paiement;
  }

  findByAbonnement(abonnementId: string) {
    return this.prisma.paiement.findMany({ where: { abonnementId }, orderBy: { creeLe: 'desc' } });
  }
}
