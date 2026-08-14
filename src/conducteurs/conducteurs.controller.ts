import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConducteursService } from './conducteurs.service';
import { CreateConducteurDto } from './dto/create-conducteur.dto';
import { UpdateConducteurDto } from './dto/update-conducteur.dto';

@ApiTags('Conducteurs')
@Controller({ path: 'conducteurs', version: '1' })
export class ConducteursController {
  constructor(private readonly conducteursService: ConducteursService) {}

  @Post()
  @ApiOperation({ summary: 'Provisionner un conducteur (badge QR généré automatiquement)' })
  @ApiResponse({ status: 201, description: 'Conducteur créé' })
  @ApiResponse({ status: 409, description: 'Un conducteur avec ce téléphone existe déjà' })
  create(@Body() dto: CreateConducteurDto) {
    return this.conducteursService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les conducteurs, éventuellement filtrés par gestionnaire' })
  @ApiQuery({ name: 'gestionnaireId', required: false, description: 'Filtrer par gestionnaire' })
  @ApiResponse({ status: 200, description: 'Liste des conducteurs' })
  findAll(@Query('gestionnaireId') gestionnaireId?: string) {
    return this.conducteursService.findAll(gestionnaireId);
  }

  @Get('badge/:qrCodeBadge')
  @ApiOperation({
    summary: 'Retrouver un conducteur par son badge QR',
    description: "Utilisé par l'app mobile lors du scan QR pour authentifier le conducteur.",
  })
  @ApiParam({ name: 'qrCodeBadge', description: 'Valeur encodée dans le QR code du badge' })
  @ApiResponse({ status: 200, description: 'Conducteur trouvé' })
  @ApiResponse({ status: 404, description: 'Badge inconnu' })
  findByBadge(@Param('qrCodeBadge') qrCodeBadge: string) {
    return this.conducteursService.findByBadge(qrCodeBadge);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un conducteur (véhicules, contacts d\'urgence, abonnements)' })
  @ApiParam({ name: 'id', description: 'Identifiant du conducteur' })
  @ApiResponse({ status: 200, description: 'Conducteur trouvé' })
  @ApiResponse({ status: 404, description: 'Conducteur introuvable' })
  findOne(@Param('id') id: string) {
    return this.conducteursService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un conducteur' })
  @ApiParam({ name: 'id', description: 'Identifiant du conducteur' })
  @ApiResponse({ status: 200, description: 'Conducteur mis à jour' })
  update(@Param('id') id: string, @Body() dto: UpdateConducteurDto) {
    return this.conducteursService.update(id, dto);
  }

  @Patch(':id/regenerer-badge')
  @ApiOperation({ summary: 'Régénérer le badge QR (ex. badge perdu/compromis)' })
  @ApiParam({ name: 'id', description: 'Identifiant du conducteur' })
  @ApiResponse({ status: 200, description: 'Nouveau badge généré' })
  regenererBadge(@Param('id') id: string) {
    return this.conducteursService.regenererBadge(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Désactiver un conducteur',
    description: "Désactivation logique (actif=false) plutôt que suppression, pour conserver l'historique trajets/scores.",
  })
  @ApiParam({ name: 'id', description: 'Identifiant du conducteur' })
  @ApiResponse({ status: 200, description: 'Conducteur désactivé' })
  remove(@Param('id') id: string) {
    return this.conducteursService.remove(id);
  }
}
