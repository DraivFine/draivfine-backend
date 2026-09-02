import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { utilisateur: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };
  let notifications: { envoyerEmail: jest.Mock; envoyerSms: jest.Mock };

  const gestionnaire = {
    id: 'user-gestionnaire',
    type: 'GESTIONNAIRE',
    nom: 'Éric Talla',
    telephone: null,
    motDePasseHash: '',
    photoUrl: null,
    codeResetHash: null as string | null,
    codeResetExpire: null as Date | null,
    gestionnaire: { id: 'user-gestionnaire', email: 'nom@flotte.cm', entreprise: null, role: 'GESTIONNAIRE_FLOTTE' },
    conducteur: null,
    passager: null,
  };

  const conducteur = {
    id: 'user-conducteur',
    type: 'CONDUCTEUR',
    nom: 'Jean Mbarga',
    telephone: '+237677123456',
    motDePasseHash: '',
    photoUrl: null,
    codeResetHash: null as string | null,
    codeResetExpire: null as Date | null,
    gestionnaire: null,
    conducteur: { id: 'user-conducteur', qrCodeBadge: 'BADGE-1', gestionnaireId: null, actif: true },
    passager: null,
  };

  beforeEach(async () => {
    prisma = {
      utilisateur: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token-jwt') };
    notifications = { envoyerEmail: jest.fn(), envoyerSms: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it("connecte un gestionnaire par e-mail avec le bon mot de passe", async () => {
      const utilisateur = { ...gestionnaire, motDePasseHash: await bcrypt.hash('MotDePasse123', 10) };
      prisma.utilisateur.findFirst.mockResolvedValue(utilisateur);

      const resultat = await service.login({ identifiant: 'nom@flotte.cm', motDePasse: 'MotDePasse123' });

      expect(prisma.utilisateur.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { gestionnaire: { email: 'nom@flotte.cm' } } }),
      );
      expect(resultat.accessToken).toBe('token-jwt');
      expect(resultat.utilisateur.id).toBe('user-gestionnaire');
    });

    it('normalise un numéro local avant de chercher un conducteur/passager', async () => {
      const utilisateur = { ...conducteur, motDePasseHash: await bcrypt.hash('MotDePasse123', 10) };
      prisma.utilisateur.findUnique.mockResolvedValue(utilisateur);

      await service.login({ identifiant: '0677123456', motDePasse: 'MotDePasse123' });

      expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { telephone: '+237677123456' } }),
      );
    });

    it("rejette un identifiant inconnu", async () => {
      prisma.utilisateur.findFirst.mockResolvedValue(null);

      await expect(service.login({ identifiant: 'inconnu@flotte.cm', motDePasse: 'MotDePasse123' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejette un mauvais mot de passe', async () => {
      const utilisateur = { ...gestionnaire, motDePasseHash: await bcrypt.hash('MotDePasse123', 10) };
      prisma.utilisateur.findFirst.mockResolvedValue(utilisateur);

      await expect(
        service.login({ identifiant: 'nom@flotte.cm', motDePasse: 'MauvaisMotDePasse' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejette un conducteur désactivé même avec le bon mot de passe', async () => {
      const utilisateur = {
        ...conducteur,
        motDePasseHash: await bcrypt.hash('MotDePasse123', 10),
        conducteur: { ...conducteur.conducteur, actif: false },
      };
      prisma.utilisateur.findUnique.mockResolvedValue(utilisateur);

      await expect(
        service.login({ identifiant: '+237677123456', motDePasse: 'MotDePasse123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changerMotDePasse', () => {
    it('met à jour le mot de passe quand l\'ancien est correct', async () => {
      const ancienHash = await bcrypt.hash('AncienMotDePasse1', 10);
      prisma.utilisateur.findUnique.mockResolvedValue({ ...gestionnaire, motDePasseHash: ancienHash });
      prisma.utilisateur.update.mockResolvedValue({});

      const resultat = await service.changerMotDePasse('user-gestionnaire', {
        ancienMotDePasse: 'AncienMotDePasse1',
        nouveauMotDePasse: 'NouveauMotDePasse1',
      });

      expect(resultat).toEqual({ message: 'Mot de passe modifié' });
      const donneesMiseAJour = prisma.utilisateur.update.mock.calls[0][0];
      expect(donneesMiseAJour.where).toEqual({ id: 'user-gestionnaire' });
      await expect(bcrypt.compare('NouveauMotDePasse1', donneesMiseAJour.data.motDePasseHash)).resolves.toBe(true);
    });

    it("échoue si l'utilisateur n'existe plus", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(
        service.changerMotDePasse('id-inconnu', { ancienMotDePasse: 'x', nouveauMotDePasse: 'NouveauMotDePasse1' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.utilisateur.update).not.toHaveBeenCalled();
    });

    it("échoue si l'ancien mot de passe est incorrect", async () => {
      const ancienHash = await bcrypt.hash('AncienMotDePasse1', 10);
      prisma.utilisateur.findUnique.mockResolvedValue({ ...gestionnaire, motDePasseHash: ancienHash });

      await expect(
        service.changerMotDePasse('user-gestionnaire', {
          ancienMotDePasse: 'FauxMotDePasse',
          nouveauMotDePasse: 'NouveauMotDePasse1',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.utilisateur.update).not.toHaveBeenCalled();
    });
  });

  describe('demanderReinitialisationMotDePasse', () => {
    const messageAttendu = 'Si un compte correspond à cet identifiant, un code de réinitialisation a été envoyé';

    it('génère un code et envoie un e-mail pour un gestionnaire', async () => {
      prisma.utilisateur.findFirst.mockResolvedValue(gestionnaire);
      prisma.utilisateur.update.mockResolvedValue({});

      const resultat = await service.demanderReinitialisationMotDePasse({ identifiant: 'nom@flotte.cm' });

      expect(resultat).toEqual({ message: messageAttendu });
      expect(notifications.envoyerEmail).toHaveBeenCalledTimes(1);
      expect(notifications.envoyerEmail.mock.calls[0][0]).toBe('nom@flotte.cm');
      expect(notifications.envoyerSms).not.toHaveBeenCalled();

      const donneesMiseAJour = prisma.utilisateur.update.mock.calls[0][0];
      expect(donneesMiseAJour.where).toEqual({ id: 'user-gestionnaire' });
      expect(donneesMiseAJour.data.codeResetHash).toEqual(expect.any(String));
      expect(donneesMiseAJour.data.codeResetExpire.getTime()).toBeGreaterThan(Date.now());
    });

    it('envoie un SMS pour un conducteur/passager', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(conducteur);
      prisma.utilisateur.update.mockResolvedValue({});

      await service.demanderReinitialisationMotDePasse({ identifiant: '+237677123456' });

      expect(notifications.envoyerSms).toHaveBeenCalledTimes(1);
      expect(notifications.envoyerSms.mock.calls[0][0]).toBe('+237677123456');
      expect(notifications.envoyerEmail).not.toHaveBeenCalled();
    });

    it('renvoie le même message générique sans effectuer de mise à jour ni de notification quand le compte est inconnu', async () => {
      prisma.utilisateur.findFirst.mockResolvedValue(null);

      const resultat = await service.demanderReinitialisationMotDePasse({ identifiant: 'inconnu@flotte.cm' });

      expect(resultat).toEqual({ message: messageAttendu });
      expect(prisma.utilisateur.update).not.toHaveBeenCalled();
      expect(notifications.envoyerEmail).not.toHaveBeenCalled();
      expect(notifications.envoyerSms).not.toHaveBeenCalled();
    });
  });

  describe('reinitialiserMotDePasse', () => {
    it('réinitialise le mot de passe avec un code valide et non expiré, puis invalide le code', async () => {
      const codeResetHash = await bcrypt.hash('123456', 10);
      prisma.utilisateur.findFirst.mockResolvedValue({
        ...gestionnaire,
        codeResetHash,
        codeResetExpire: new Date(Date.now() + 60_000),
      });
      prisma.utilisateur.update.mockResolvedValue({});

      const resultat = await service.reinitialiserMotDePasse({
        identifiant: 'nom@flotte.cm',
        code: '123456',
        nouveauMotDePasse: 'NouveauMotDePasse1',
      });

      expect(resultat).toEqual({ message: 'Mot de passe réinitialisé' });
      const donneesMiseAJour = prisma.utilisateur.update.mock.calls[0][0];
      expect(donneesMiseAJour.data.codeResetHash).toBeNull();
      expect(donneesMiseAJour.data.codeResetExpire).toBeNull();
      await expect(bcrypt.compare('NouveauMotDePasse1', donneesMiseAJour.data.motDePasseHash)).resolves.toBe(true);
    });

    it("rejette un code expiré", async () => {
      const codeResetHash = await bcrypt.hash('123456', 10);
      prisma.utilisateur.findFirst.mockResolvedValue({
        ...gestionnaire,
        codeResetHash,
        codeResetExpire: new Date(Date.now() - 1_000),
      });

      await expect(
        service.reinitialiserMotDePasse({
          identifiant: 'nom@flotte.cm',
          code: '123456',
          nouveauMotDePasse: 'NouveauMotDePasse1',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.utilisateur.update).not.toHaveBeenCalled();
    });

    it('rejette un mauvais code', async () => {
      const codeResetHash = await bcrypt.hash('123456', 10);
      prisma.utilisateur.findFirst.mockResolvedValue({
        ...gestionnaire,
        codeResetHash,
        codeResetExpire: new Date(Date.now() + 60_000),
      });

      await expect(
        service.reinitialiserMotDePasse({
          identifiant: 'nom@flotte.cm',
          code: '000000',
          nouveauMotDePasse: 'NouveauMotDePasse1',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.utilisateur.update).not.toHaveBeenCalled();
    });

    it("rejette quand aucune réinitialisation n'a été demandée (pas de code en base)", async () => {
      prisma.utilisateur.findFirst.mockResolvedValue({ ...gestionnaire, codeResetHash: null, codeResetExpire: null });

      await expect(
        service.reinitialiserMotDePasse({
          identifiant: 'nom@flotte.cm',
          code: '123456',
          nouveauMotDePasse: 'NouveauMotDePasse1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
