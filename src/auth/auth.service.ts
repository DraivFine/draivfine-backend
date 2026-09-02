import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { normalizeTelephoneCameroun } from '../common/normalize-telephone';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { DemanderReinitialisationDto } from './dto/demander-reinitialisation.dto';
import { LoginDto } from './dto/login.dto';
import { ReinitialiserMotDePasseDto } from './dto/reinitialiser-mot-de-passe.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const DUREE_VALIDITE_CODE_RESET_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Un seul login sert aux trois profils : le gestionnaire (dashboard) se
  // connecte par e-mail, conducteur et passager (app mobile) par téléphone.
  // On recherche donc l'Utilisateur (table qui porte le mot de passe commun
  // aux trois) via la relation appropriée selon la forme de l'identifiant
  // saisi. Réutilisé par le login et par la réinitialisation de mot de passe.
  private trouverUtilisateurParIdentifiant(identifiant: string) {
    const estEmail = identifiant.includes('@');
    return estEmail
      ? this.prisma.utilisateur.findFirst({
          where: { gestionnaire: { email: identifiant } },
          include: { gestionnaire: true, conducteur: true, passager: true },
        })
      : this.prisma.utilisateur.findUnique({
          where: { telephone: normalizeTelephoneCameroun(identifiant) },
          include: { gestionnaire: true, conducteur: true, passager: true },
        });
  }

  async login(dto: LoginDto) {
    const utilisateur = await this.trouverUtilisateurParIdentifiant(dto.identifiant);
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

  async changerMotDePasse(utilisateurId: string, dto: ChangerMotDePasseDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const ancienMotDePasseValide = await bcrypt.compare(dto.ancienMotDePasse, utilisateur.motDePasseHash);
    if (!ancienMotDePasseValide) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    const motDePasseHash = await bcrypt.hash(dto.nouveauMotDePasse, 10);
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { motDePasseHash },
    });

    return { message: 'Mot de passe modifié' };
  }

  // Mot de passe oublié : pas de session à ce stade, donc identification par
  // identifiant (email/téléphone) plutôt que par token. Le message de retour
  // est volontairement identique que le compte existe ou non, pour ne pas
  // permettre à un tiers de deviner quels identifiants sont enregistrés.
  async demanderReinitialisationMotDePasse(dto: DemanderReinitialisationDto) {
    const utilisateur = await this.trouverUtilisateurParIdentifiant(dto.identifiant);
    const message = 'Si un compte correspond à cet identifiant, un code de réinitialisation a été envoyé';

    if (!utilisateur) {
      return { message };
    }

    const code = randomInt(100000, 1000000).toString();
    const codeResetHash = await bcrypt.hash(code, 10);
    await this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { codeResetHash, codeResetExpire: new Date(Date.now() + DUREE_VALIDITE_CODE_RESET_MS) },
    });

    if (utilisateur.gestionnaire) {
      await this.notificationsService.envoyerEmail(
        utilisateur.gestionnaire.email,
        'Réinitialisation de votre mot de passe',
        `Votre code de réinitialisation est ${code}. Il expire dans 15 minutes.`,
      );
    } else if (utilisateur.telephone) {
      await this.notificationsService.envoyerSms(
        utilisateur.telephone,
        `Votre code de réinitialisation DraivFine est ${code}. Il expire dans 15 minutes.`,
      );
    }

    return { message };
  }

  async reinitialiserMotDePasse(dto: ReinitialiserMotDePasseDto) {
    const utilisateur = await this.trouverUtilisateurParIdentifiant(dto.identifiant);
    if (!utilisateur?.codeResetHash || !utilisateur.codeResetExpire) {
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }

    if (utilisateur.codeResetExpire < new Date()) {
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }

    const codeValide = await bcrypt.compare(dto.code, utilisateur.codeResetHash);
    if (!codeValide) {
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }

    const motDePasseHash = await bcrypt.hash(dto.nouveauMotDePasse, 10);
    await this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { motDePasseHash, codeResetHash: null, codeResetExpire: null },
    });

    return { message: 'Mot de passe réinitialisé' };
  }

  // Authentification 100% stateless (JWT signé, pas de session ni de
  // blacklist) : rien à invalider côté serveur, le token reste valide
  // jusqu'à expiration naturelle. Existe pour que le client ait un appel
  // explicite à faire avant de supprimer le token stocké.
  logout() {
    return { message: 'Déconnecté' };
  }
}
