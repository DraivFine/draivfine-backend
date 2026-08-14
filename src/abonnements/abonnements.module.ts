import { Module } from '@nestjs/common';
import { AbonnementsService } from './abonnements.service';
import { AbonnementsController } from './abonnements.controller';

@Module({
  controllers: [AbonnementsController],
  providers: [AbonnementsService],
  exports: [AbonnementsService],
})
export class AbonnementsModule {}
