import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { DemarrerTrajetDto } from './dto/demarrer-trajet.dto';
import { TerminerTrajetDto } from './dto/terminer-trajet.dto';
import { SCORING_QUEUE } from '../scoring/scoring.constants';

@Injectable()
export class TrajetsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SCORING_QUEUE) private readonly scoringQueue: Queue,
  ) {}

  demarrer(dto: DemarrerTrajetDto) {
    return this.prisma.trajet.create({
      data: {
        conducteurId: dto.conducteurId,
        vehiculeId: dto.vehiculeId,
        passagerId: dto.passagerId,
        debut: new Date(),
      },
    });
  }

  async terminer(id: string, dto: TerminerTrajetDto) {
    const trajet = await this.prisma.trajet.findUnique({ where: { id } });
    if (!trajet) throw new NotFoundException('Trajet introuvable');
    if (!trajet.enCours) {
      throw new BadRequestException('Ce trajet est déjà terminé');
    }

    const trajetTermine = await this.prisma.trajet.update({
      where: { id },
      data: {
        fin: new Date(),
        enCours: false,
        distanceKm: dto.distanceKm,
        montant: dto.montant,
      },
    });

    // Le calcul de score part en tâche de fond — l'API répond immédiatement,
    // sans attendre l'analyse du pattern de conduite.
    await this.scoringQueue.add(
      'calculer-score',
      { trajetId: id },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return trajetTermine;
  }

  findAll(conducteurId?: string) {
    return this.prisma.trajet.findMany({
      where: conducteurId ? { conducteurId } : undefined,
      include: { score: true, vehicule: true },
      orderBy: { debut: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const trajet = await this.prisma.trajet.findUnique({
      where: { id },
      include: { score: { include: { alertes: true } }, vehicule: true, conducteur: true },
    });
    if (!trajet) throw new NotFoundException('Trajet introuvable');
    return trajet;
  }
}
