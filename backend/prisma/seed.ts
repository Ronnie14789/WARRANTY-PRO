import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const [driverRole, officerRole, investigatorRole, adminRole] = await Promise.all([
    prisma.role.upsert({ where: { name: 'DRIVER' }, update: {}, create: { name: 'DRIVER' } }),
    prisma.role.upsert({ where: { name: 'WARRANTY_OFFICER' }, update: {}, create: { name: 'WARRANTY_OFFICER' } }),
    prisma.role.upsert({ where: { name: 'TECHNICAL_INVESTIGATOR' }, update: {}, create: { name: 'TECHNICAL_INVESTIGATOR' } }),
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } })
  ]);

  const brand = await prisma.vehicleBrand.upsert({
    where: { name: 'Volvo' },
    update: {},
    create: { name: 'Volvo' }
  });

  const model = await prisma.vehicleModel.upsert({
    where: { name_year_brandId: { name: 'FH16', year: 2026, brandId: brand.id } },
    update: {},
    create: { name: 'FH16', year: 2026, brandId: brand.id }
  });

  const policy = await prisma.warrantyPolicy.upsert({
    where: { id: 'std-heavy-duty-policy' },
    update: {},
    create: { id: 'std-heavy-duty-policy', name: 'Heavy Duty Standard', durationMonths: 36, mileageLimit: 250000, terms: 'Standard heavy duty warranty terms.' }
  });

  await prisma.partCatalog.upsert({
    where: { partNumber: 'TRB-9981' },
    update: {},
    create: { partName: 'Turbocharger', partNumber: 'TRB-9981', description: 'Heavy duty turbocharger', warrantyPolicyId: policy.id }
  });

  const adminHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@wcims.local' },
    update: { roleId: adminRole.id },
    create: { email: 'admin@wcims.local', fullName: 'System Administrator', passwordHash: adminHash, roleId: adminRole.id }
  });

  console.log({ driverRole, officerRole, investigatorRole, adminRole, model });
}

main().finally(async () => {
  await prisma.$disconnect();
});
