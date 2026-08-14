import { Body, Controller, Post } from '@nestjs/common';
import { CapteursService } from './capteurs.service';
import { IngestCapteurDto } from './dto/ingest-capteur.dto';

@Controller({ path: 'capteurs', version: '1' })
export class CapteursController {
  constructor(private readonly capteursService: CapteursService) {}

  @Post('ingest')
  ingest(@Body() dto: IngestCapteurDto) {
    return this.capteursService.ingest(dto);
  }
}
