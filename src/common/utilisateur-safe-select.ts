// Sélection Prisma partagée par tous les modules qui renvoient un
// Utilisateur (ou sa relation depuis Conducteur/Passager/Gestionnaire) via
// l'API : motDePasseHash n'y figure jamais, même haché.
export const UTILISATEUR_SAFE_SELECT = {
  id: true,
  type: true,
  nom: true,
  telephone: true,
  photoUrl: true,
  creeLe: true,
} as const;
