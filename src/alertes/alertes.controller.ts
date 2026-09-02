import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { AlertesService } from './alertes.service';
import { DeclencherUrgenceDto } from './dto/declencher-urgence.dto';
import { SignalerIncidentDto } from './dto/signaler-incident.dto';
import { UpdateStatutAlerteDto } from './dto/update-statut-alerte.dto';

const PHOTOS_DIR = join(process.cwd(), 'uploads', 'photos');
if (!existsSync(PHOTOS_DIR)) mkdirSync(PHOTOS_DIR, { recursive: true });

const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Alertes')
@Controller({ path: 'alertes', version: '1' })
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Post('urgence')
  @ApiOperation({
    summary: "Déclencher le bouton d'urgence",
    description:
      "Diffuse en parallèle (websocket, SMS aux contacts d'urgence, push au gestionnaire) sans attendre la confirmation d'un canal avant de déclencher les autres.",
  })
  @ApiResponse({ status: 201, description: 'Alerte urgence créée et diffusion lancée' })
  declencherUrgence(@Body() dto: DeclencherUrgenceDto) {
    return this.alertesService.creerUrgence(dto);
  }

  @Post('incident')
  @ApiOperation({
    summary: 'Signaler un incident non vital pendant un trajet',
    description:
      "Contrairement à /alertes/urgence, ne prévient pas les contacts d'urgence par SMS — seul le gestionnaire de flotte est notifié (push).",
  })
  @ApiResponse({ status: 201, description: 'Incident enregistré et gestionnaire notifié' })
  signalerIncident(@Body() dto: SignalerIncidentDto) {
    return this.alertesService.creerIncident(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les alertes, éventuellement filtrées par statut et/ou conducteur/passager' })
  @ApiQuery({ name: 'statut', required: false, enum: ['NOUVELLE', 'EN_COURS', 'RESOLUE', 'IGNOREE'] })
  @ApiQuery({ name: 'conducteurId', required: false, description: "Filtrer par conducteur (historique mobile)" })
  @ApiQuery({ name: 'passagerId', required: false, description: "Filtrer par passager (historique mobile)" })
  @ApiResponse({ status: 200, description: 'Liste des alertes (200 plus récentes)' })
  findAll(
    @Query('statut') statut?: string,
    @Query('conducteurId') conducteurId?: string,
    @Query('passagerId') passagerId?: string,
  ) {
    return this.alertesService.findAll(statut, conducteurId, passagerId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une alerte" })
  @ApiParam({ name: 'id', description: "Identifiant de l'alerte" })
  @ApiResponse({ status: 200, description: 'Alerte trouvée' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable' })
  findOne(@Param('id') id: string) {
    return this.alertesService.findOne(id);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une alerte" })
  @ApiParam({ name: 'id', description: "Identifiant de l'alerte" })
  @ApiResponse({ status: 200, description: 'Alerte mise à jour' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable' })
  updateStatut(@Param('id') id: string, @Body() dto: UpdateStatutAlerteDto) {
    return this.alertesService.updateStatut(id, dto);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: "Ajouter des photos à une alerte (ex. photos d'un accident)" })
  @ApiParam({ name: 'id', description: "Identifiant de l'alerte" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photos'],
      properties: {
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Jusqu’à 5 images JPEG, PNG ou WebP — 5 Mo maximum chacune',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photos ajoutées, alerte mise à jour' })
  @ApiResponse({ status: 400, description: 'Fichier manquant, format non supporté ou trop volumineux' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable' })
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: PHOTOS_DIR,
        filename: (_req, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!FORMATS_ACCEPTES.includes(file.mimetype)) {
          callback(new BadRequestException('Formats acceptés : JPEG, PNG, WebP'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  ajouterPhotos(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipeBuilder().build({ fileIsRequired: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    photos: Express.Multer.File[],
  ) {
    return this.alertesService.ajouterPhotos(
      id,
      photos.map((photo) => `/uploads/photos/${photo.filename}`),
    );
  }
}
