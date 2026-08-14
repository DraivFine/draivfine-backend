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

  findAll(conducteurId?: string) {
    return this.prisma.vehicule.findMany({
      where: conducteurId ? { conducteurId } : undefined,
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
