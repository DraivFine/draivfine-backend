import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UTILISATEUR_SAFE_SELECT } from '../common/utilisateur-safe-select';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePassagerDto } from './dto/create-passager.dto';

@Injectable()
export class PassagersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePassagerDto) {
    const existant = await this.prisma.utilisateur.findUnique({
      where: { telephone: dto.telephone },
    });
    if (existant) {
      throw new ConflictException('Un utilisateur avec ce numéro existe déjà');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    // Même principe que pour Conducteur : une ligne Utilisateur (profil
    // commun) puis une ligne Passager (spécialisation) liées par le même id,
    // créées dans une transaction pour ne jamais laisser l'une sans l'autre.
    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          type: 'PASSAGER',
          nom: dto.nom,
          telephone: dto.telephone,
          motDePasseHash,
        },
      });

      return tx.passager.create({
        data: { id: utilisateur.id },
        include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      });
    });
  }

  findAll() {
    return this.prisma.passager.findMany({
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      orderBy: { utilisateur: { creeLe: 'desc' } },
    });
  }

  async findOne(id: string) {
    const passager = await this.prisma.passager.findUnique({
      where: { id },
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT }, contactsUrgence: true },
    });
    if (!passager) {
      throw new NotFoundException('Passager introuvable');
    }
    return passager;
  }
}
