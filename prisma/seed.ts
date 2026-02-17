import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create owner user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'admin@autodealer.pt' },
    update: {},
    create: {
      email: 'admin@autodealer.pt',
      name: 'Admin',
      password: hashedPassword,
      role: 'OWNER',
      phone: '+351 912 345 678',
    },
  });

  console.log('Created owner user:', owner.email);
  console.log('Password: admin123');

  // Create sample cars
  const cars = await Promise.all([
    prisma.car.create({
      data: {
        make: 'Volkswagen',
        model: 'Golf',
        year: 2020,
        color: 'White',
        mileage: 45000,
        vin: 'WVWZZZ1KZLW123456',
        licensePlate: 'AA-12-BB',
        purchasePrice: 8500,
        purchaseDate: new Date('2024-11-01'),
        boughtFrom: 'Auto Lisboa',
        targetPrice: 11500,
        minimumPrice: 10500,
        status: 'AVAILABLE',
        location: 'Lot A',
        conditionNotes: 'Minor scratch on rear bumper. Full service history.',
      },
    }),
    prisma.car.create({
      data: {
        make: 'BMW',
        model: '320d',
        year: 2019,
        color: 'Black',
        mileage: 78000,
        vin: 'WBA8E9C50KAK12345',
        licensePlate: 'CC-34-DD',
        purchasePrice: 15000,
        purchaseDate: new Date('2024-10-15'),
        boughtFrom: 'Private Seller',
        targetPrice: 19500,
        minimumPrice: 18000,
        status: 'AVAILABLE',
        location: 'Lot A',
      },
    }),
    prisma.car.create({
      data: {
        make: 'Mercedes',
        model: 'C-Class',
        year: 2021,
        color: 'Silver',
        mileage: 32000,
        vin: 'WDDWF8DB5LA123456',
        licensePlate: 'EE-56-FF',
        purchasePrice: 22000,
        purchaseDate: new Date('2024-09-20'),
        boughtFrom: 'Mercedes Dealer Porto',
        targetPrice: 28000,
        minimumPrice: 26000,
        status: 'IN_REPAIR',
        location: 'Workshop',
        conditionNotes: 'Needs new brake pads and oil change.',
      },
    }),
  ]);

  console.log(`Created ${cars.length} sample cars`);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'João Silva',
        phone: '+351 911 222 333',
        email: 'joao@email.com',
        leadSource: 'WALK_IN',
        status: 'NEGOTIATING',
        notes: 'Interested in the Golf. Budget around €11,000.',
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Santos',
        phone: '+351 922 333 444',
        email: 'maria@email.com',
        leadSource: 'OLX',
        status: 'NEW_LEAD',
        notes: 'Saw the BMW on OLX. Wants to schedule a test drive.',
      },
    }),
  ]);

  console.log(`Created ${customers.length} sample customers`);

  // Create sample expense
  await prisma.expense.create({
    data: {
      carId: cars[0].id,
      type: 'DETAILING',
      amount: 150,
      date: new Date('2024-11-05'),
      description: 'Full interior and exterior detailing',
      vendor: 'Clean Car Services',
      userId: owner.id,
    },
  });

  console.log('Created sample expense');
  console.log('\n Seed complete! You can now log in with:');
  console.log('   Email: admin@autodealer.pt');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
