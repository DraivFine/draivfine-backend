import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { normalizeTelephoneCameroun } from '../common/normalize-telephone';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Un seul login sert aux trois profils : le gestionnaire (dashboard) se
    // connecte par e-mail, conducteur et passager (app mobile) par
    // téléphone. On recherche donc l'Utilisateur (table qui porte le mot de
    // passe commun aux trois) via la relation appropriée selon la forme de
    // l'identifiant saisi.
    const estEmail = dto.identifiant.includes('@');

    const utilisateur = estEmail
      ? await this.prisma.utilisateur.findFirst({
          where: { gestionnaire: { email: dto.identifiant } },
          include: { gestionnaire: true, conducteur: true, passager: true },
        })
      : await this.prisma.utilisateur.findUnique({
          where: { telephone: normalizeTelephoneCameroun(dto.identifiant) },
          include: { gestionnaire: true, conducteur: true, passager: true },
        });
    if (!utilisateur) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) throw new UnauthorizedException('Identifiants invalides');

    // Un conducteur désactivé (cf. ConducteursService.remove — désactivation
    // logique, badge révoqué) ne doit plus pouvoir se connecter.
    if (utilisateur.type === 'CONDUCTEUR' && utilisateur.conducteur && !utilisateur.conducteur.actif) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const payload: JwtPayload = {
      sub: utilisateur.id,
      type: utilisateur.type,
      role: utilisateur.gestionnaire?.role,
      email: utilisateur.gestionnaire?.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        type: utilisateur.type,
        email: utilisateur.gestionnaire?.email,
        telephone: utilisateur.telephone,
        role: utilisateur.gestionnaire?.role,
      },
    };
  }

  // Authentification 100% stateless (JWT signé, pas de session ni de
  // blacklist) : rien à invalider côté serveur, le token reste valide
  // jusqu'à expiration naturelle. Existe pour que le client ait un appel
  // explicite à faire avant de supprimer le token stocké.
  logout() {
    return { message: 'Déconnecté' };
  }
}
