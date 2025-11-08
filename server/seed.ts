import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890'
    }
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@demo.com' },
    update: {},
    create: {
      email: 'supervisor@demo.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Supervisor',
      role: 'SUPERVISOR',
      phone: '+1234567891'
    }
  });

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker@demo.com' },
    update: {},
    create: {
      email: 'worker@demo.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Worker',
      role: 'TRADE_WORKER',
      phone: '+1234567892'
    }
  });

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@demo.com' },
    update: {},
    create: {
      email: 'worker2@demo.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'TRADE_WORKER',
      phone: '+1234567893'
    }
  });

  console.log('✅ Users created');

  // Create sites
  const site1 = await prisma.site.create({
    data: {
      name: 'Downtown Construction Project',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  });

  const site2 = await prisma.site.create({
    data: {
      name: 'Riverside Apartments',
      address: '456 River Road',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201'
    }
  });

  console.log('✅ Sites created');

  // Create materials
  const materials = await Promise.all([
    prisma.material.create({
      data: {
        name: 'Plasterboard 12mm',
        category: 'PLASTERBOARD',
        defaultUnit: 'SHEETS',
        minimumStock: 50,
        currentStock: 150,
        costPerUnit: 12.99,
        supplier: 'BuildCo Supplies'
      }
    }),
    prisma.material.create({
      data: {
        name: 'Joint Compound',
        category: 'COMPOUND',
        defaultUnit: 'BAGS',
        minimumStock: 20,
        currentStock: 75,
        costPerUnit: 18.50,
        supplier: 'BuildCo Supplies'
      }
    }),
    prisma.material.create({
      data: {
        name: 'Drywall Screws 25mm',
        category: 'SCREWS',
        defaultUnit: 'BOXES',
        minimumStock: 30,
        currentStock: 100,
        costPerUnit: 8.99,
        supplier: 'Hardware Direct'
      }
    }),
    prisma.material.create({
      data: {
        name: 'Paper Tape',
        category: 'TAPE',
        defaultUnit: 'ROLLS',
        minimumStock: 25,
        currentStock: 80,
        costPerUnit: 5.49,
        supplier: 'BuildCo Supplies'
      }
    }),
    prisma.material.create({
      data: {
        name: 'Sanding Sponge',
        category: 'TOOLS',
        defaultUnit: 'UNITS',
        minimumStock: 50,
        currentStock: 120,
        costPerUnit: 3.99,
        supplier: 'Tool World'
      }
    })
  ]);

  console.log('✅ Materials created');

  // Create activities with phases
  const activity1 = await prisma.activity.create({
    data: {
      type: 'UNIT',
      siteId: site1.id,
      building: 'A',
      floor: '3',
      unit: '301',
      area: 'Living Room',
      supervisorId: supervisor.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: 'Priority unit - tenant moving in soon',
      workers: {
        create: [{ workerId: worker1.id }, { workerId: worker2.id }]
      },
      phases: {
        create: [
          { phaseNumber: 1, phaseName: 'PLASTERBOARD_FIXING', percentage: 100, status: 'COMPLETED' },
          { phaseNumber: 2, phaseName: 'TAPING', percentage: 50, status: 'IN_PROGRESS' },
          { phaseNumber: 3, phaseName: 'SECOND_COAT', percentage: 0, status: 'PENDING' },
          { phaseNumber: 4, phaseName: 'TOP_COAT', percentage: 0, status: 'PENDING' },
          { phaseNumber: 5, phaseName: 'SANDING', percentage: 0, status: 'PENDING' }
        ]
      }
    }
  });

  const activity2 = await prisma.activity.create({
    data: {
      type: 'UNIT',
      siteId: site1.id,
      building: 'A',
      floor: '3',
      unit: '302',
      supervisorId: supervisor.id,
      priority: 'NORMAL',
      status: 'PENDING',
      workers: {
        create: [{ workerId: worker1.id }]
      },
      phases: {
        create: [
          { phaseNumber: 1, phaseName: 'PLASTERBOARD_FIXING', percentage: 0, status: 'PENDING' },
          { phaseNumber: 2, phaseName: 'TAPING', percentage: 0, status: 'PENDING' },
          { phaseNumber: 3, phaseName: 'SECOND_COAT', percentage: 0, status: 'PENDING' },
          { phaseNumber: 4, phaseName: 'TOP_COAT', percentage: 0, status: 'PENDING' },
          { phaseNumber: 5, phaseName: 'SANDING', percentage: 0, status: 'PENDING' }
        ]
      }
    }
  });

  const activity3 = await prisma.activity.create({
    data: {
      type: 'PATCH',
      siteId: site2.id,
      building: 'B',
      floor: '2',
      unit: '201',
      area: 'Kitchen',
      supervisorId: supervisor.id,
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      notes: 'Water damage repair',
      workers: {
        create: [{ workerId: worker2.id }]
      },
      phases: {
        create: [
          { phaseNumber: 1, phaseName: 'PLASTERBOARD_FIXING', percentage: 100, status: 'COMPLETED' },
          { phaseNumber: 2, phaseName: 'TAPING', percentage: 100, status: 'COMPLETED' },
          { phaseNumber: 3, phaseName: 'SECOND_COAT', percentage: 75, status: 'IN_PROGRESS' },
          { phaseNumber: 4, phaseName: 'TOP_COAT', percentage: 0, status: 'PENDING' },
          { phaseNumber: 5, phaseName: 'SANDING', percentage: 0, status: 'PENDING' }
        ]
      }
    }
  });

  console.log('✅ Activities created');

  // Create material requests
  await prisma.materialRequest.create({
    data: {
      requestedById: worker1.id,
      materialId: materials[0].id,
      activityId: activity1.id,
      quantity: 10,
      unit: 'SHEETS',
      urgency: 'NORMAL',
      justification: 'Need additional plasterboard for unit completion',
      status: 'PENDING'
    }
  });

  await prisma.materialRequest.create({
    data: {
      requestedById: worker2.id,
      materialId: materials[1].id,
      activityId: activity3.id,
      quantity: 3,
      unit: 'BAGS',
      urgency: 'URGENT',
      justification: 'Running low on joint compound for patch repair',
      status: 'APPROVED',
      approvedById: supervisor.id,
      approverNotes: 'Approved - high priority patch',
      respondedAt: new Date()
    }
  });

  console.log('✅ Material requests created');

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: worker1.id,
      type: 'ACTIVITY_ASSIGNED',
      title: 'New Activity Assigned',
      message: 'You have been assigned to Unit A-301'
    }
  });

  await prisma.notification.create({
    data: {
      userId: supervisor.id,
      type: 'MATERIAL_REQUEST',
      title: 'New Material Request',
      message: 'Mike Worker requested 10 sheets of Plasterboard'
    }
  });

  console.log('✅ Notifications created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('Admin: admin@demo.com / demo123');
  console.log('Supervisor: supervisor@demo.com / demo123');
  console.log('Worker: worker@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
