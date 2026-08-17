import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactsUrgenceService } from './contacts-urgence.service';
import { CreateContactUrgenceDto } from './dto/create-contact-urgence.dto';
import { UpdateContactUrgenceDto } from './dto/update-contact-urgence.dto';

@ApiTags("Contacts d'urgence")
@Controller({ path: 'contacts-urgence', version: '1' })
export class ContactsUrgenceController {
  constructor(private readonly contactsUrgenceService: ContactsUrgenceService) {}

  @Post()
  @ApiOperation({ summary: "Ajouter un contact d'urgence pour un passager ou un conducteur" })
  @ApiResponse({ status: 201, description: 'Contact créé' })
  @ApiResponse({ status: 400, description: 'passagerId ou conducteurId manquant (ou les deux fournis)' })
  create(@Body() dto: CreateContactUrgenceDto) {
    return this.contactsUrgenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Lister les contacts d'urgence, filtrés par passager ou conducteur" })
  @ApiQuery({ name: 'passagerId', required: false, description: 'Filtrer par passager' })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur' })
  @ApiResponse({ status: 200, description: "Liste des contacts d'urgence" })
  findAll(@Query('passagerId') passagerId?: string, @Query('conducteurId') conducteurId?: string) {
    return this.contactsUrgenceService.findAll(passagerId, conducteurId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un contact d'urgence" })
  @ApiParam({ name: 'id', description: 'Identifiant du contact' })
  @ApiResponse({ status: 200, description: 'Contact trouvé' })
  @ApiResponse({ status: 404, description: 'Contact introuvable' })
  findOne(@Param('id') id: string) {
    return this.contactsUrgenceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour un contact d'urgence (nom, téléphone, actif...)" })
  @ApiParam({ name: 'id', description: 'Identifiant du contact' })
  @ApiResponse({ status: 200, description: 'Contact mis à jour' })
  @ApiResponse({ status: 404, description: 'Contact introuvable' })
  update(@Param('id') id: string, @Body() dto: UpdateContactUrgenceDto) {
    return this.contactsUrgenceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un contact d'urgence" })
  @ApiParam({ name: 'id', description: 'Identifiant du contact' })
  @ApiResponse({ status: 200, description: 'Contact supprimé' })
  @ApiResponse({ status: 404, description: 'Contact introuvable' })
  remove(@Param('id') id: string) {
    return this.contactsUrgenceService.remove(id);
  }
}
