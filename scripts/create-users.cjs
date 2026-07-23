const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('Ldz52385109', 12);

  // 普通用户（买家/卖家通用）
  const user1 = await prisma.user.upsert({
    where: { email: 'yeatrusourcing' },
    update: { passwordHash: hash, name: 'Yeatru Sourcing', role: 'USER' },
    create: { email: 'yeatrusourcing', passwordHash: hash, name: 'Yeatru Sourcing', role: 'USER' },
  });
  console.log('User created:', user1.email, '| Role:', user1.role);

  // 管理员
  const admin = await prisma.user.upsert({
    where: { email: 'etruemart' },
    update: { passwordHash: hash, name: 'eTruemart Admin', role: 'ADMIN' },
    create: { email: 'etruemart', passwordHash: hash, name: 'eTruemart Admin', role: 'ADMIN' },
  });
  console.log('Admin created:', admin.email, '| Role:', admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
