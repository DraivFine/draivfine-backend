import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ScoringService } from './scoring.service';
import { ScoringProcessor } from './scoring.processor';
import { ScoringController } from './scoring.controller';
import { MlClientService } from './ml-client.service';
import { HeuristiquesService } from './heuristiques.service';
import { SCORING_QUEUE } from './scoring.constants';
import { AlertesModule } from '../alertes/alertes.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: SCORING_QUEUE }),
    HttpModule,
    AlertesModule,
  ],
  controllers: [ScoringController],
  providers: [ScoringService, ScoringProcessor, MlClientService, HeuristiquesService],
  exports: [ScoringService],
})
export class ScoringModule {}
