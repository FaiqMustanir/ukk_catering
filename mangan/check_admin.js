const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@mangan.id' }
  });
  console.log('Admin User:', admin);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
