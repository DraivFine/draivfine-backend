import { Module } from '@nestjs/common';
import { GestionnairesService } from './gestionnaires.service';
import { GestionnairesController } from './gestionnaires.controller';

@Module({
  controllers: [GestionnairesController],
  providers: [GestionnairesService],
  exports: [GestionnairesService],
})
export class GestionnairesModule {}
