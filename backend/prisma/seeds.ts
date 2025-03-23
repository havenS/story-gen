import { seedTypes } from './seeds/types.seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await seedTypes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });