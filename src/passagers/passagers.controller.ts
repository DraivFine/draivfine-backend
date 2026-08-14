import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassagersService } from './passagers.service';
import { CreatePassagerDto } from './dto/create-passager.dto';

@ApiTags('Passagers')
@Controller({ path: 'passagers', version: '1' })
export class PassagersController {
  constructor(private readonly passagersService: PassagersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un compte passager' })
  @ApiResponse({ status: 201, description: 'Passager créé' })
  @ApiResponse({ status: 409, description: 'Un utilisateur avec ce numéro existe déjà' })
  create(@Body() dto: CreatePassagerDto) {
    return this.passagersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les passagers' })
  @ApiResponse({ status: 200, description: 'Liste des passagers' })
  findAll() {
    return this.passagersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un passager (avec ses contacts d'urgence)" })
  @ApiParam({ name: 'id', description: 'Identifiant du passager' })
  @ApiResponse({ status: 200, description: 'Passager trouvé' })
  @ApiResponse({ status: 404, description: 'Passager introuvable' })
  findOne(@Param('id') id: string) {
    return this.passagersService.findOne(id);
  }
}
