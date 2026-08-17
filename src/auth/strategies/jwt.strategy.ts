import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RoleUtilisateur, TypeUtilisateur } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  // Profil du compte connecté (gestionnaire dashboard, ou conducteur/passager
  // app mobile) — role/email n'existent que pour un Gestionnaire.
  type: TypeUtilisateur;
  role?: RoleUtilisateur;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret')!,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
