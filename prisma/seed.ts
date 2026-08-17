import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ids fixes (plutôt que @default(uuid()) laissé à Prisma) pour que le seeder
// soit idempotent via upsert : relancer `prisma db seed` met à jour ces
// mêmes lignes au lieu d'en recréer de nouvelles à chaque fois.
const PLANS = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nom: 'Basique',
    prixMensuel: 1000,
    dureeJours: 30,
    description: 'Suivi de base pour un conducteur indépendant.',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    nom: 'Standard',
    prixMensuel: 2000,
    dureeJours: 30,
    description: 'Scoring comportemental complet avec alertes en temps réel.',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    nom: 'Premium',
    prixMensuel: 3500,
    dureeJours: 30,
    description: 'Suivi avancé pour flottes, avec support prioritaire.',
  },
];

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
