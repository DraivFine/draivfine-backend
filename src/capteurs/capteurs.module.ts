import { Module } from '@nestjs/common';
import { CapteursService } from './capteurs.service';
import { CapteursController } from './capteurs.controller';

@Module({
  controllers: [CapteursController],
  providers: [CapteursService],
})
export class CapteursModule {}
