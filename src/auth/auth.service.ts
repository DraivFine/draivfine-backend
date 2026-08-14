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
    const utilisateur = await this.prisma.gestionnaire.findUnique({ where: { email: dto.email } });
    if (!utilisateur) throw new UnauthorizedException('Identifiants invalides');

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) throw new UnauthorizedException('Identifiants invalides');

    const payload = { sub: utilisateur.id, email: utilisateur.email, role: utilisateur.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role },
    };
  }
}
