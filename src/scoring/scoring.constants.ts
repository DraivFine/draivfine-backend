export const SCORING_QUEUE = 'scoring';
export const CALCULER_SCORE_JOB = 'calculer-score';

// Seuils heuristiques (utilisés en MVP et en fallback si le service ML est
// indisponible). À terme, remplacés/complétés par le modèle scikit-learn/XGBoost.
export const SEUILS_HEURISTIQUES = {
  freinageBrusqueMs2: -3.5, // décélération en m/s²
  accelerationBrusqueMs2: 3.0, // accélération en m/s²
  excesVitesseKmh: 80, // au-delà, on compte un excès (à ajuster par type de voie)
  ecartTrajectoireDegres: 45, // changement de cap brutal entre deux points GPS
};
