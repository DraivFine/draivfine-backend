import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GestionnairesService } from './gestionnaires.service';
import { CreateGestionnaireDto } from './dto/create-gestionnaire.dto';

@ApiTags('Gestionnaires')
@Controller({ path: 'gestionnaires', version: '1' })
export class GestionnairesController {
  constructor(private readonly gestionnairesService: GestionnairesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un compte gestionnaire (dashboard flotte)',
    description: 'Toujours créé avec le rôle GESTIONNAIRE_FLOTTE — aucun moyen de choisir le rôle via cet endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Gestionnaire créé' })
  @ApiResponse({ status: 409, description: 'Un gestionnaire avec cet e-mail existe déjà' })
  create(@Body() dto: CreateGestionnaireDto) {
    return this.gestionnairesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les gestionnaires' })
  @ApiResponse({ status: 200, description: 'Liste des gestionnaires' })
  findAll() {
    return this.gestionnairesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un gestionnaire (avec ses conducteurs)" })
  @ApiParam({ name: 'id', description: 'Identifiant du gestionnaire' })
  @ApiResponse({ status: 200, description: 'Gestionnaire trouvé' })
  @ApiResponse({ status: 404, description: 'Gestionnaire introuvable' })
  findOne(@Param('id') id: string) {
    return this.gestionnairesService.findOne(id);
  }
}
