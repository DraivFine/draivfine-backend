import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TypeUtilisateur } from '@prisma/client';
import { diskStorage } from 'multer';
import { UtilisateursService } from './utilisateurs.service';

const PHOTOS_DIR = join(process.cwd(), 'uploads', 'photos');
if (!existsSync(PHOTOS_DIR)) mkdirSync(PHOTOS_DIR, { recursive: true });

const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Utilisateurs')
@Controller({ path: 'utilisateurs', version: '1' })
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs (passagers, conducteurs, gestionnaires confondus)' })
  @ApiQuery({ name: 'type', required: false, enum: TypeUtilisateur, description: 'Filtrer par type de compte' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs (sans le hash de mot de passe)' })
  findAll(@Query('type') type?: TypeUtilisateur) {
    return this.utilisateursService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: "Profil commun d'un utilisateur (passager, conducteur ou gestionnaire)" })
  @ApiParam({ name: 'id', description: 'Identifiant utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé (sans le hash de mot de passe)' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(id);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Uploader ou remplacer la photo de profil' })
  @ApiParam({ name: 'id', description: 'Identifiant utilisateur' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: { type: 'string', format: 'binary', description: 'Image JPEG, PNG ou WebP — 5 Mo maximum' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo enregistrée, photoUrl mis à jour' })
  @ApiResponse({ status: 400, description: 'Fichier manquant, format non supporté ou trop volumineux' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  @UseInterceptors(
    FileInterceptor('photo', {
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
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder().build({ fileIsRequired: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    photo: Express.Multer.File,
  ) {
    return this.utilisateursService.updatePhoto(id, `/uploads/photos/${photo.filename}`);
  }
}
