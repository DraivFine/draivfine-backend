import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbonnementDto } from './dto/create-abonnement.dto';

@Injectable()
export class AbonnementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAbonnementDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plan introuvable');

    const renouvelleLe = new Date();
    renouvelleLe.setDate(renouvelleLe.getDate() + plan.dureeJours);

    return this.prisma.abonnement.create({
      data: { ...dto, renouvelleLe },
    });
  }

  findAll(conducteurId?: string) {
    return this.prisma.abonnement.findMany({
      where: conducteurId ? { conducteurId } : undefined,
      include: { paiements: true },
    });
  }

  async findOne(id: string) {
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id },
      include: { paiements: true },
    });
    if (!abonnement) throw new NotFoundException('Abonnement introuvable');
    return abonnement;
  }

  async marquerActif(id: string) {
    return this.prisma.abonnement.update({ where: { id }, data: { statut: 'ACTIF' } });
  }

  async suspendre(id: string) {
    return this.prisma.abonnement.update({ where: { id }, data: { statut: 'SUSPENDU' } });
  }
}
