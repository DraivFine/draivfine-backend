import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Injectable()
export class VehiculesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehiculeDto) {
    const existant = await this.prisma.vehicule.findUnique({
      where: { immatriculation: dto.immatriculation },
    });
    if (existant) {
      throw new ConflictException('Immatriculation déjà enregistrée');
    }
    return this.prisma.vehicule.create({ data: dto });
  }

  findAll(conducteurId?: string, immatriculation?: string, modele?: string) {
    return this.prisma.vehicule.findMany({
      where: {
        conducteurId,
        immatriculation: immatriculation ? { contains: immatriculation, mode: 'insensitive' } : undefined,
        modele: modele ? { contains: modele, mode: 'insensitive' } : undefined,
      },
    });
  }

  // Utilisé par l'app mobile passager lors du scan du badge conducteur, pour
  // proposer le(s) véhicule(s) avant de démarrer un trajet (cf.
  // ConducteursService.findByBadge pour le même principe côté conducteur).
  async findByBadge(qrCodeBadge: string) {
    const conducteur = await this.prisma.conducteur.findUnique({ where: { qrCodeBadge } });
    if (!conducteur) throw new NotFoundException('Badge inconnu');

    return this.prisma.vehicule.findMany({
      where: { conducteurId: conducteur.id },
      orderBy: { creeLe: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicule = await this.prisma.vehicule.findUnique({ where: { id } });
    if (!vehicule) throw new NotFoundException('Véhicule introuvable');
    return vehicule;
  }

  async update(id: string, dto: UpdateVehiculeDto) {
    await this.findOne(id);
    return this.prisma.vehicule.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicule.delete({ where: { id } });
  }
}
