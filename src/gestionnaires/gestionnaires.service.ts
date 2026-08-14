import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UTILISATEUR_SAFE_SELECT } from '../common/utilisateur-safe-select';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGestionnaireDto } from './dto/create-gestionnaire.dto';

@Injectable()
export class GestionnairesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGestionnaireDto) {
    const existant = await this.prisma.gestionnaire.findUnique({ where: { email: dto.email } });
    if (existant) {
      throw new ConflictException('Un gestionnaire avec cet e-mail existe déjà');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    // Même principe que pour Conducteur/Passager : une ligne Utilisateur
    // (profil commun, sans téléphone pour un gestionnaire — l'identifiant de
    // connexion est l'e-mail) puis une ligne Gestionnaire, liées par le même
    // id, dans une transaction.
    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          type: 'GESTIONNAIRE',
          nom: dto.nom,
          motDePasseHash,
        },
      });

      return tx.gestionnaire.create({
        data: {
          id: utilisateur.id,
          email: dto.email,
          entreprise: dto.entreprise,
        },
        include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      });
    });
  }

  findAll() {
    return this.prisma.gestionnaire.findMany({
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      orderBy: { utilisateur: { creeLe: 'desc' } },
    });
  }

  async findOne(id: string) {
    const gestionnaire = await this.prisma.gestionnaire.findUnique({
      where: { id },
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT }, conducteurs: true },
    });
    if (!gestionnaire) {
      throw new NotFoundException('Gestionnaire introuvable');
    }
    return gestionnaire;
  }
}
