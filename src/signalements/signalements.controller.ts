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
import { StatutSignalement } from '@prisma/client';
import { diskStorage } from 'multer';
import { SignalementsService } from './signalements.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { UpdateStatutSignalementDto } from './dto/update-statut-signalement.dto';

const PHOTOS_DIR = join(process.cwd(), 'uploads', 'photos');
if (!existsSync(PHOTOS_DIR)) mkdirSync(PHOTOS_DIR, { recursive: true });

const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Signalements')
@Controller({ path: 'signalements', version: '1' })
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Signaler un accident ou un comportement dangereux (sans compte requis)',
    description:
      "Seule la position GPS est obligatoire. Le témoin peut préciser une plaque d'immatriculation relevée ou un badge conducteur scanné : le rapprochement avec un conducteur/véhicule reste best-effort, le signalement est enregistré même si rien n'est retrouvé.",
  })
  @ApiResponse({ status: 201, description: 'Signalement enregistré' })
  create(@Body() dto: CreateSignalementDto) {
    return this.signalementsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les signalements, éventuellement filtrés' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutSignalement })
  @ApiQuery({ name: 'conducteurId', required: false, description: 'Filtrer par conducteur identifié' })
  @ApiQuery({ name: 'vehiculeId', required: false, description: 'Filtrer par véhicule identifié' })
  @ApiResponse({ status: 200, description: 'Liste des signalements (200 plus récents)' })
  findAll(
    @Query('statut') statut?: StatutSignalement,
    @Query('conducteurId') conducteurId?: string,
    @Query('vehiculeId') vehiculeId?: string,
  ) {
    return this.signalementsService.findAll(statut, conducteurId, vehiculeId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un signalement" })
  @ApiParam({ name: 'id', description: 'Identifiant du signalement' })
  @ApiResponse({ status: 200, description: 'Signalement trouvé' })
  @ApiResponse({ status: 404, description: 'Signalement introuvable' })
  findOne(@Param('id') id: string) {
    return this.signalementsService.findOne(id);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'un signalement (traitement par le gestionnaire)" })
  @ApiParam({ name: 'id', description: 'Identifiant du signalement' })
  @ApiResponse({ status: 200, description: 'Signalement mis à jour' })
  @ApiResponse({ status: 404, description: 'Signalement introuvable' })
  updateStatut(@Param('id') id: string, @Body() dto: UpdateStatutSignalementDto) {
    return this.signalementsService.updateStatut(id, dto);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Ajouter des photos à un signalement' })
  @ApiParam({ name: 'id', description: 'Identifiant du signalement' })
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
  @ApiResponse({ status: 201, description: 'Photos ajoutées, signalement mis à jour' })
  @ApiResponse({ status: 400, description: 'Fichier manquant, format non supporté ou trop volumineux' })
  @ApiResponse({ status: 404, description: 'Signalement introuvable' })
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
    return this.signalementsService.ajouterPhotos(
      id,
      photos.map((photo) => `/uploads/photos/${photo.filename}`),
    );
  }
}
