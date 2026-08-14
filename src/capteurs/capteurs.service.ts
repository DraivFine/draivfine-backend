import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IngestCapteurDto } from './dto/ingest-capteur.dto';

@Injectable()
export class CapteursService {
  private readonly logger = new Logger(CapteursService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest(dto: IngestCapteurDto) {
    const trajet = await this.prisma.trajet.findUnique({
      where: { id: dto.trajetId },
      select: { id: true, enCours: true },
    });
    if (!trajet) throw new NotFoundException('Trajet introuvable');

    // Écriture en masse — table à fort volume (TimescaleDB), on ack vite au
    // mobile sans bloquer sur le calcul de score (fait séparément à la fin
    // du trajet, cf. TrajetsService.terminer).
    const { count } = await this.prisma.donneeCapteur.createMany({
      data: dto.points.map((p) => ({
        trajetId: dto.trajetId,
        horodatage: new Date(p.horodatage),
        latitude: p.latitude,
        longitude: p.longitude,
        vitesse: p.vitesse,
        acceleration: p.acceleration,
        gyroscopeX: p.gyroscopeX,
        gyroscopeY: p.gyroscopeY,
        gyroscopeZ: p.gyroscopeZ,
      })),
    });

    this.logger.debug(`${count} points capteurs ingérés pour le trajet ${dto.trajetId}`);
    return { recus: count };
  }
}
