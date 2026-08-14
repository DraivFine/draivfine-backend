import { Injectable } from '@nestjs/common';
import { DonneeCapteur } from '@prisma/client';
import { SEUILS_HEURISTIQUES } from './scoring.constants';
import { ResultatScoring } from './interfaces/resultat-scoring.interface';

/**
 * Calcul de score par règles heuristiques (seuils sur accélération/vitesse).
 * Sert de solution MVP et de repli si le microservice ML est indisponible.
 */
@Injectable()
export class HeuristiquesService {
  calculer(points: DonneeCapteur[]): ResultatScoring {
    let freinagesBrusques = 0;
    let accelerationsBrusques = 0;
    let excesVitesse = 0;
    let trajectoireAnormale = false;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      if (p.acceleration != null) {
        if (p.acceleration <= SEUILS_HEURISTIQUES.freinageBrusqueMs2) freinagesBrusques++;
        if (p.acceleration >= SEUILS_HEURISTIQUES.accelerationBrusqueMs2) accelerationsBrusques++;
      }

      if (p.vitesse != null && p.vitesse >= SEUILS_HEURISTIQUES.excesVitesseKmh) {
        excesVitesse++;
      }

      if (i > 0) {
        const cap = this.calculerChangementCap(points[i - 1], p);
        if (cap >= SEUILS_HEURISTIQUES.ecartTrajectoireDegres) trajectoireAnormale = true;
      }
    }

    const penalites =
      freinagesBrusques * 4 + accelerationsBrusques * 3 + excesVitesse * 5 + (trajectoireAnormale ? 10 : 0);
    const noteGlobale = Math.max(0, Math.min(100, 100 - penalites));

    return {
      noteGlobale,
      niveauRisque: this.deriverNiveauRisque(noteGlobale),
      freinagesBrusques,
      accelerationsBrusques,
      excesVitesse,
      trajectoireAnormale,
      sourceCalcul: 'heuristique',
    };
  }

  private deriverNiveauRisque(note: number): ResultatScoring['niveauRisque'] {
    if (note >= 80) return 'FAIBLE';
    if (note >= 60) return 'MODERE';
    if (note >= 35) return 'ELEVE';
    return 'CRITIQUE';
  }

  private calculerChangementCap(a: DonneeCapteur, b: DonneeCapteur): number {
    const capA = Math.atan2(b.latitude - a.latitude, b.longitude - a.longitude);
    const capB = Math.atan2(b.latitude - a.latitude, b.longitude - a.longitude);
    return Math.abs(((capB - capA) * 180) / Math.PI);
  }
}
