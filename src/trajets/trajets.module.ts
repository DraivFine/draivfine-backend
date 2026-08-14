import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrajetsService } from './trajets.service';
import { TrajetsController } from './trajets.controller';
import { SCORING_QUEUE } from '../scoring/scoring.constants';

@Module({
  imports: [BullModule.registerQueue({ name: SCORING_QUEUE })],
  controllers: [TrajetsController],
  providers: [TrajetsService],
  exports: [TrajetsService],
})
export class TrajetsModule {}
