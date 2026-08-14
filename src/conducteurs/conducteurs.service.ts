import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UTILISATEUR_SAFE_SELECT } from '../common/utilisateur-safe-select';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConducteurDto } from './dto/create-conducteur.dto';
import { UpdateConducteurDto } from './dto/update-conducteur.dto';

@Injectable()
export class ConducteursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConducteurDto) {
    // L'unicité du téléphone se vérifie sur Utilisateur : c'est la table
    // qui porte réellement la colonne (partagée entre passagers, conducteurs
    // et, en théorie, gestionnaires).
    const existant = await this.prisma.utilisateur.findUnique({
      where: { telephone: dto.telephone },
    });
    if (existant) {
      throw new ConflictException('Un utilisateur avec ce numéro existe déjà');
    }

    // Créer un conducteur crée toujours deux lignes liées par le même id :
    // Utilisateur (profil commun) puis Conducteur (spécialisation), dans une
    // transaction pour ne jamais laisser l'une sans l'autre.
    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          type: 'CONDUCTEUR',
          nom: dto.nom,
          telephone: dto.telephone,
          motDePasseHash,
        },
      });

      return tx.conducteur.create({
        data: {
          id: utilisateur.id,
          gestionnaireId: dto.gestionnaireId,
          // badge unique scanné par l'app mobile — régénérable si perdu
          qrCodeBadge: randomUUID(),
        },
        include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      });
    });
  }

  findAll(gestionnaireId?: string) {
    return this.prisma.conducteur.findMany({
      where: gestionnaireId ? { gestionnaireId } : undefined,
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT }, vehicules: true, contactsUrgence: true },
      orderBy: { utilisateur: { creeLe: 'desc' } },
    });
  }

  async findOne(id: string) {
    const conducteur = await this.prisma.conducteur.findUnique({
      where: { id },
      include: {
        utilisateur: { select: UTILISATEUR_SAFE_SELECT },
        vehicules: true,
        contactsUrgence: true,
        abonnements: true,
      },
    });
    if (!conducteur) {
      throw new NotFoundException('Conducteur introuvable');
    }
    return conducteur;
  }

  async findByBadge(qrCodeBadge: string) {
    const conducteur = await this.prisma.conducteur.findUnique({
      where: { qrCodeBadge },
      include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
    });
    if (!conducteur) {
      throw new NotFoundException('Badge inconnu');
    }
    return conducteur;
  }

  async update(id: string, dto: UpdateConducteurDto) {
    await this.findOne(id);
    const { nom, telephone, motDePasse, gestionnaireId } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (nom !== undefined || telephone !== undefined || motDePasse !== undefined) {
        await tx.utilisateur.update({
          where: { id },
          data: {
            nom,
            telephone,
            motDePasseHash: motDePasse !== undefined ? await bcrypt.hash(motDePasse, 10) : undefined,
          },
        });
      }
      return tx.conducteur.update({
        where: { id },
        data: { gestionnaireId },
        include: { utilisateur: { select: UTILISATEUR_SAFE_SELECT } },
      });
    });
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
