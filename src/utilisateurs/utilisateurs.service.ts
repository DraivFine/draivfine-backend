import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeUtilisateur } from '@prisma/client';
import { UTILISATEUR_SAFE_SELECT as SAFE_SELECT } from '../common/utilisateur-safe-select';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(type?: TypeUtilisateur) {
    return this.prisma.utilisateur.findMany({
      where: type ? { type } : undefined,
      select: SAFE_SELECT,
      orderBy: { creeLe: 'desc' },
    });
  }

  async findOne(id: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id },
      select: SAFE_SELECT,
    });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return utilisateur;
  }

  async updatePhoto(id: string, photoUrl: string) {
    await this.findOne(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: { photoUrl },
      select: SAFE_SELECT,
    });
  }
}
