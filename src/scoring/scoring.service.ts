import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MlClientService } from './ml-client.service';
import { HeuristiquesService } from './heuristiques.service';
import { AlertesService } from '../alertes/alertes.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mlClient: MlClientService,
    private readonly heuristiques: HeuristiquesService,
    private readonly alertesService: AlertesService,
    private readonly config: ConfigService,
  ) {}

  async calculerScorePourTrajet(trajetId: string) {
    const points = await this.prisma.donneeCapteur.findMany({
      where: { trajetId },
      orderBy: { horodatage: 'asc' },
    });

    if (points.length === 0) {
      this.logger.warn(`Aucune donnée capteur pour le trajet ${trajetId}, score ignoré`);
      return null;
    }

    // On tente d'abord le microservice ML ; si indisponible et que le
    // fallback est activé, on retombe sur les règles heuristiques.
    let resultat = await this.mlClient.scorer(trajetId, points);
    if (!resultat) {
      if (!this.config.get<boolean>('mlService.fallbackToHeuristics')) {
        throw new Error('Service ML indisponible et fallback heuristique désactivé');
      }
      resultat = this.heuristiques.calculer(points);
    }

    const score = await this.prisma.score.upsert({
      where: { trajetId },
      create: { trajetId, ...resultat },
      update: { ...resultat },
    });

    // Déclenchement d'alertes si le niveau de risque le justifie
    if (score.niveauRisque === 'ELEVE' || score.niveauRisque === 'CRITIQUE') {
      const dernierPoint = points[points.length - 1];
      await this.alertesService.creerDepuisScore(score, {
        latitude: dernierPoint.latitude,
        longitude: dernierPoint.longitude,
      });
    }

    return score;
  }
}
