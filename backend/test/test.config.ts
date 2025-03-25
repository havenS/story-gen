import { PrismaClient } from '@prisma/client';

// Verify we're using the test database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.includes('_test')) {
  throw new Error('Test database URL must include "_test"');
}

export const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Clean up the database before tests
  await prisma.$transaction([
    prisma.publishing.deleteMany(),
    prisma.chapters.deleteMany(),
    prisma.stories.deleteMany(),
    prisma.types.deleteMany(),
  ]);
}

export async function teardownTestDatabase() {
  // Clean up the database after tests
  await prisma.$transaction([
    prisma.publishing.deleteMany(),
    prisma.chapters.deleteMany(),
    prisma.stories.deleteMany(),
    prisma.types.deleteMany(),
  ]);
  await prisma.$disconnect();
}
