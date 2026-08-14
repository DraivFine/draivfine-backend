import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConducteurDto } from './dto/create-conducteur.dto';
import { UpdateConducteurDto } from './dto/update-conducteur.dto';

@Injectable()
export class ConducteursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConducteurDto) {
    const existant = await this.prisma.conducteur.findUnique({
      where: { telephone: dto.telephone },
    });
    if (existant) {
      throw new ConflictException('Un conducteur avec ce numéro existe déjà');
    }

    return this.prisma.conducteur.create({
      data: {
        ...dto,
        // badge unique scanné par l'app mobile — régénérable si perdu
        qrCodeBadge: randomUUID(),
      },
    });
  }

  findAll(gestionnaireId?: string) {
    return this.prisma.conducteur.findMany({
      where: gestionnaireId ? { gestionnaireId } : undefined,
      include: { vehicules: true, contactsUrgence: true },
      orderBy: { creeLe: 'desc' },
    });
  }

  async findOne(id: string) {
    const conducteur = await this.prisma.conducteur.findUnique({
      where: { id },
      include: { vehicules: true, contactsUrgence: true, abonnements: true },
    });
    if (!conducteur) {
      throw new NotFoundException('Conducteur introuvable');
    }
    return conducteur;
  }

  async findByBadge(qrCodeBadge: string) {
    const conducteur = await this.prisma.conducteur.findUnique({
      where: { qrCodeBadge },
    });
    if (!conducteur) {
      throw new NotFoundException('Badge inconnu');
    }
    return conducteur;
  }

  async update(id: string, dto: UpdateConducteurDto) {
    await this.findOne(id);
    return this.prisma.conducteur.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Désactivation plutôt que suppression : on garde l'historique trajets/scores
    return this.prisma.conducteur.update({
      where: { id },
      data: { actif: false },
    });
  }

  async regenererBadge(id: string) {
    await this.findOne(id);
    return this.prisma.conducteur.update({
      where: { id },
      data: { qrCodeBadge: randomUUID() },
    });
  }
}
