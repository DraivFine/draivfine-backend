import { Injectable, NotFoundException } from '@nestjs/common';
import { StatutSignalement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { UpdateStatutSignalementDto } from './dto/update-statut-signalement.dto';

@Injectable()
export class SignalementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSignalementDto) {
    // Signalement public (sans compte) : le témoin ne connaît ni conducteurId
    // ni vehiculeId, seulement ce qu'il a sous les yeux (plaque relevée,
    // badge scanné). La résolution reste best-effort — un signalement
    // reste valide même si rien n'est retrouvé (cf. schema.prisma).
    let conducteurId: string | undefined;
    let vehiculeId: string | undefined;

    if (dto.immatriculation) {
      const vehicule = await this.prisma.vehicule.findUnique({ where: { immatriculation: dto.immatriculation } });
      if (vehicule) {
        vehiculeId = vehicule.id;
        conducteurId = vehicule.conducteurId;
      }
    }

    if (!conducteurId && dto.badgeConducteur) {
      const conducteur = await this.prisma.conducteur.findUnique({ where: { qrCodeBadge: dto.badgeConducteur } });
      if (conducteur) conducteurId = conducteur.id;
    }

    return this.prisma.signalement.create({
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        description: dto.description,
        telephoneTemoin: dto.telephoneTemoin,
        trajetId: dto.trajetId,
        conducteurId,
        vehiculeId,
      },
    });
  }

  findAll(statut?: StatutSignalement, conducteurId?: string, vehiculeId?: string) {
    return this.prisma.signalement.findMany({
      where: { statut, conducteurId, vehiculeId },
      orderBy: { creeLe: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string) {
    const signalement = await this.prisma.signalement.findUnique({ where: { id } });
    if (!signalement) throw new NotFoundException('Signalement introuvable');
    return signalement;
  }

  async updateStatut(id: string, dto: UpdateStatutSignalementDto) {
    await this.findOne(id);
    return this.prisma.signalement.update({ where: { id }, data: { statut: dto.statut } });
  }

  async ajouterPhotos(id: string, urls: string[]) {
    await this.findOne(id);
    return this.prisma.signalement.update({ where: { id }, data: { photos: { push: urls } } });
  }
}
