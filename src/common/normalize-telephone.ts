// Les numéros sont stockés en E.164 (+237XXXXXXXXX, cf. CreateConducteurDto /
// CreatePassagerDto), mais un utilisateur qui se connecte ne tape pas
// toujours l'indicatif. Cette fonction ramène les formats courants saisis au
// Cameroun (local à 9 chiffres, "00237...", "237...") vers l'E.164 attendu
// par la colonne Utilisateur.telephone, pour que la recherche en base aboutisse.
export function normalizeTelephoneCameroun(saisie: string): string {
  const valeur = saisie.trim().replace(/[\s.\-()]/g, '');

  if (valeur.startsWith('+')) return valeur;
  if (valeur.startsWith('00')) return `+${valeur.slice(2)}`;
  if (valeur.startsWith('237')) return `+${valeur}`;
  if (/^0\d{9}$/.test(valeur)) return `+237${valeur.slice(1)}`;
  if (/^\d{9}$/.test(valeur)) return `+237${valeur}`;

  return valeur;
}
