import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const gestionnaire = await this.prisma.gestionnaire.findUnique({
      where: { email: dto.email },
      include: { utilisateur: true },
    });
    if (!gestionnaire || !gestionnaire.utilisateur.motDePasseHash) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, gestionnaire.utilisateur.motDePasseHash);
    if (!motDePasseValide) throw new UnauthorizedException('Identifiants invalides');

    const payload = { sub: gestionnaire.id, email: gestionnaire.email, role: gestionnaire.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      utilisateur: {
        id: gestionnaire.id,
        nom: gestionnaire.utilisateur.nom,
        email: gestionnaire.email,
        role: gestionnaire.role,
      },
    };
  }
}
