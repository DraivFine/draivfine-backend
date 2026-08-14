import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SCORING_QUEUE } from './scoring.constants';
import { ScoringService } from './scoring.service';

@Processor(SCORING_QUEUE)
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);

  constructor(private readonly scoringService: ScoringService) {
    super();
  }

  async process(job: Job<{ trajetId: string }>) {
    this.logger.debug(`Traitement du job de scoring pour le trajet ${job.data.trajetId}`);
    return this.scoringService.calculerScorePourTrajet(job.data.trajetId);
  }
}
