import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Score } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DeclencherUrgenceDto } from './dto/declencher-urgence.dto';
import { UpdateStatutAlerteDto } from './dto/update-statut-alerte.dto';

@Injectable()
export class AlertesService {
  private readonly logger = new Logger(AlertesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /** Alerte issue d'un score de trajet à risque (freinages, excès, trajectoire). */
  async creerDepuisScore(score: Score, position: { latitude: number; longitude: number }) {
    const type =
      score.excesVitesse > 0
        ? 'EXCES_VITESSE'
        : score.freinagesBrusques > 0
          ? 'FREINAGE_BRUSQUE'
          : score.trajectoireAnormale
            ? 'TRAJECTOIRE_ANORMALE'
            : 'ACCELERATION_BRUSQUE';

    const alerte = await this.prisma.alerte.create({
      data: {
        scoreId: score.id,
        type,
        message: `Score ${score.noteGlobale}/100 — niveau de risque ${score.niveauRisque}`,
        ...position,
      },
    });

    this.realtimeGateway.diffuserAlerte(alerte);
    return alerte;
  }

  /**
   * Bouton d'urgence : diffusion en parallèle (websocket + SMS + push),
   * sans attendre de confirmation d'une branche pour déclencher les autres —
   * c'est ce qui garantit que l'alerte sort même si la data mobile coupe
   * juste après l'appel HTTP.
   */
  async creerUrgence(dto: DeclencherUrgenceDto) {
    let alerte = await this.prisma.alerte.create({
      data: {
        type: dto.type,
        message: 'Bouton urgence déclenché',
        conducteurId: dto.conducteurId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        trajetId: dto.trajetId,
      },
    });

    // trajetId est optionnel sur le DTO : ne chercher/mettre à jour le
    // passager que s'il a été fourni, sinon findUnique({ id: undefined })
    // lève une erreur Prisma.
    if (dto.trajetId) {
      const trajet = await this.prisma.trajet.findUnique({ where: { id: dto.trajetId } });
      if (trajet?.passagerId) {
        alerte = await this.prisma.alerte.update({
          where: { id: alerte.id },
          data: { passagerId: trajet.passagerId },
        });
      }
    }

    const conducteur = await this.prisma.conducteur.findUnique({
      where: { id: dto.conducteurId },
      include: { utilisateur: true, contactsUrgence: true, gestionnaire: true },
    });

    const diffusions: Promise<unknown>[] = [
      Promise.resolve(this.realtimeGateway.diffuserAlerte(alerte)),
    ];

    for (const contact of conducteur?.contactsUrgence ?? []) {
      if (!contact.actif || !contact.telephone) continue;
      diffusions.push(
        this.notifications.envoyerSms(
          contact.telephone,
          `Urgence signalée pour ${conducteur?.utilisateur.nom}. Position : ${dto.latitude}, ${dto.longitude}`,
        ),
      );
    }

    if (conducteur?.gestionnaire) {
      diffusions.push(
        this.notifications.envoyerPush(
          conducteur.gestionnaire.id,
          'Urgence conducteur',
          `${conducteur.utilisateur.nom} a déclenché le bouton d'urgence`,
        ),
      );
    }

    // On lance tout en parallèle ; un échec d'une branche (ex. SMS) ne doit
    // jamais bloquer les autres.
    const resultats = await Promise.allSettled(diffusions);
    resultats
      .filter((r) => r.status === 'rejected')
      .forEach((r) => this.logger.error('Échec diffusion urgence', (r as PromiseRejectedResult).reason));

    return alerte;
  }

  findAll(statut?: string) {
    return this.prisma.alerte.findMany({
      where: statut ? { statut: statut as any } : undefined,
      orderBy: { creeLe: 'desc' },
      take: 200,
    });
  }

  async updateStatut(id: string, dto: UpdateStatutAlerteDto) {
    const alerte = await this.prisma.alerte.findUnique({ where: { id } });
    if (!alerte) throw new NotFoundException('Alerte introuvable');

    return this.prisma.alerte.update({
      where: { id },
      data: {
        statut: dto.statut,
        resolueLe: dto.statut === 'RESOLUE' ? new Date() : alerte.resolueLe,
      },
    });
  }
}
