import { NiveauRisque } from '@prisma/client';

export interface ResultatScoring {
  noteGlobale: number; // 0-100, 100 = conduite exemplaire
  niveauRisque: NiveauRisque;
  freinagesBrusques: number;
  accelerationsBrusques: number;
  excesVitesse: number;
  trajectoireAnormale: boolean;
  sourceCalcul: 'ml' | 'heuristique';
}
