import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { MomoProvider } from './providers/momo.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';

@Injectable()
export class PaiementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly momoProvider: MomoProvider,
    private readonly orangeMoneyProvider: OrangeMoneyProvider,
  ) {}

  async create(dto: CreatePaiementDto) {
    const reference = randomUUID();
    const provider = dto.operateur === 'MTN_MOMO' ? this.momoProvider : this.orangeMoneyProvider;

    const paiement = await this.prisma.paiement.create({
      data: {
        abonnementId: dto.abonnementId,
        operateur: dto.operateur,
        montant: dto.montant,
        referenceExterne: reference,
      },
    });

    const resultat = await provider.demanderPaiement({
      telephone: dto.telephone,
      montant: dto.montant,
      devise: 'XAF',
      reference,
    });

    return this.prisma.paiement.update({
      where: { id: paiement.id },
      data: { statut: resultat.statut },
    });
  }

  /** Webhook de confirmation appelé par MTN MoMo / Orange Money. */
  async confirmerParWebhook(referenceExterne: string, statut: 'REUSSI' | 'ECHOUE') {
    const paiement = await this.prisma.paiement.findFirst({ where: { referenceExterne } });
    if (!paiement) throw new BadRequestException('Référence de paiement inconnue');

    const paiementMisAJour = await this.prisma.paiement.update({
      where: { id: paiement.id },
      data: { statut },
    });

    if (statut === 'REUSSI') {
      await this.prisma.abonnement.update({
        where: { id: paiement.abonnementId },
        data: { statut: 'ACTIF' },
      });
    }

    return paiementMisAJour;
  }

  findByAbonnement(abonnementId: string) {
    return this.prisma.paiement.findMany({ where: { abonnementId }, orderBy: { creeLe: 'desc' } });
  }
}
