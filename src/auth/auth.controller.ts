import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './strategies/jwt.strategy';
import { GestionnairesService } from '../gestionnaires/gestionnaires.service';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly gestionnairesService: GestionnairesService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion dashboard (gestionnaire/admin)' })
  @ApiResponse({ status: 201, description: "Connecté — retourne un accessToken JWT" })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Profil du gestionnaire actuellement connecté (déduit du token)' })
  @ApiResponse({ status: 200, description: 'Gestionnaire courant' })
  @ApiResponse({ status: 401, description: 'Non authentifié ou token invalide' })
  @ApiResponse({ status: 404, description: 'Le compte associé au token a été supprimé' })
  moi(@CurrentUser() user: JwtPayload) {
    return this.gestionnairesService.findOne(user.sub);
  }
}
