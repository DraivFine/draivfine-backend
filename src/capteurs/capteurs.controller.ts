import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CapteursService } from './capteurs.service';
import { IngestCapteurDto } from './dto/ingest-capteur.dto';

@ApiTags('Capteurs')
@Controller({ path: 'capteurs', version: '1' })
export class CapteursController {
  constructor(private readonly capteursService: CapteursService) {}

  @Post('ingest')
  @ApiOperation({
    summary: 'Ingérer un batch de points accéléromètre/GPS pour un trajet',
    description: "Appelé en continu par l'app mobile pendant un trajet actif (batching côté client).",
  })
  @ApiResponse({ status: 201, description: 'Points enregistrés' })
  ingest(@Body() dto: IngestCapteurDto) {
    return this.capteursService.ingest(dto);
  }
}
