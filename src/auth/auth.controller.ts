import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './strategies/jwt.strategy';
import { GestionnairesService } from '../gestionnaires/gestionnaires.service';
import { ConducteursService } from '../conducteurs/conducteurs.service';
import { PassagersService } from '../passagers/passagers.service';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly gestionnairesService: GestionnairesService,
    private readonly conducteursService: ConducteursService,
    private readonly passagersService: PassagersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion (gestionnaire par e-mail, conducteur/passager par téléphone)' })
  @ApiResponse({ status: 201, description: "Connecté — retourne un accessToken JWT" })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Déconnexion',
    description:
      "Authentification 100% stateless (JWT signé, sans session ni liste de révocation) : cet endpoint ne fait qu'exiger un token valide, il ne l'invalide pas côté serveur. C'est au client de supprimer le token stocké ; il resterait sinon valide jusqu'à son expiration naturelle si quelqu'un le récupérait.",
  })
  @ApiResponse({ status: 200, description: 'Déconnecté — le client doit supprimer le token stocké' })
  @ApiResponse({ status: 401, description: 'Non authentifié ou token invalide' })
  logout() {
    return this.authService.logout();
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Profil du compte actuellement connecté (déduit du token)' })
  @ApiResponse({ status: 200, description: 'Compte courant (gestionnaire, conducteur ou passager)' })
  @ApiResponse({ status: 401, description: 'Non authentifié ou token invalide' })
  @ApiResponse({ status: 404, description: 'Le compte associé au token a été supprimé' })
  moi(@CurrentUser() user: JwtPayload) {
    switch (user.type) {
      case 'CONDUCTEUR':
        return this.conducteursService.findOne(user.sub);
      case 'PASSAGER':
        return this.passagersService.findOne(user.sub);
      default:
        return this.gestionnairesService.findOne(user.sub);
    }
  }
}
