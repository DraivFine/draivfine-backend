import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEvaluationDto) {
    const trajet = await this.prisma.trajet.findUnique({ where: { id: dto.trajetId } });
    if (!trajet) throw new NotFoundException('Trajet introuvable');
    if (trajet.enCours) {
      throw new BadRequestException("Le trajet doit être terminé avant de pouvoir être évalué");
    }
    if (trajet.passagerId !== dto.passagerId) {
      throw new BadRequestException("Ce passager n'est pas celui rattaché à ce trajet");
    }

    const existante = await this.prisma.evaluation.findUnique({ where: { trajetId: dto.trajetId } });
    if (existante) throw new ConflictException('Ce trajet a déjà été évalué');

    return this.prisma.evaluation.create({ data: dto });
  }

  findAll(passagerId?: string, conducteurId?: string) {
    return this.prisma.evaluation.findMany({
      where: {
        passagerId,
        trajet: conducteurId ? { conducteurId } : undefined,
      },
      include: { trajet: true },
      orderBy: { creeLe: 'desc' },
    });
  }

  async findOne(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: { trajet: true },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');
    return evaluation;
  }

  async update(id: string, dto: UpdateEvaluationDto) {
    await this.findOne(id);
    return this.prisma.evaluation.update({ where: { id }, data: dto });
  }

  findByTrajet(trajetId: string) {
    return this.prisma.evaluation.findUnique({
      where: { trajetId },
      include: { trajet: true },
    });
  }
}
