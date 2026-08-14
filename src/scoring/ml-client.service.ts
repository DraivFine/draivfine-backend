import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DonneeCapteur } from '@prisma/client';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { ResultatScoring } from './interfaces/resultat-scoring.interface';

/**
 * Client HTTP vers le microservice Python (FastAPI) qui héberge le modèle
 * scikit-learn/XGBoost de classification des patterns de conduite.
 */
@Injectable()
export class MlClientService {
  private readonly logger = new Logger(MlClientService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('mlService.url')!;
    this.timeoutMs = this.config.get<number>('mlService.timeoutMs')!;
  }

  async scorer(trajetId: string, points: DonneeCapteur[]): Promise<ResultatScoring | null> {
    try {
      const payload = {
        trajet_id: trajetId,
        points: points.map((p) => ({
          horodatage: p.horodatage.toISOString(),
          latitude: p.latitude,
          longitude: p.longitude,
          vitesse: p.vitesse,
          acceleration: p.acceleration,
          gyroscope_x: p.gyroscopeX,
          gyroscope_y: p.gyroscopeY,
          gyroscope_z: p.gyroscopeZ,
        })),
      };

      const { data } = await firstValueFrom(
        this.http.post(`${this.baseUrl}/scoring/predict`, payload).pipe(
          timeout(this.timeoutMs),
          catchError((err) => {
            this.logger.warn(`Service ML indisponible : ${err.message}`);
            throw err;
          }),
        ),
      );

      return {
        noteGlobale: data.note_globale,
        niveauRisque: data.niveau_risque,
        freinagesBrusques: data.freinages_brusques,
        accelerationsBrusques: data.accelerations_brusques,
        excesVitesse: data.exces_vitesse,
        trajectoireAnormale: data.trajectoire_anormale,
        sourceCalcul: 'ml',
      };
    } catch {
      return null;
    }
  }
}
