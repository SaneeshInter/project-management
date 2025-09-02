const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUsers() {
  console.log('🔍 Checking all users and their departments...\n');
  
  const users = await prisma.user.findMany({
    include: {
      departmentMaster: true,
      roleMaster: true,
    },
    orderBy: { name: 'asc' }
  });

  console.log('📊 Total users:', users.length);
  console.log('\n👥 All users:');
  
  users.forEach(user => {
    console.log(`- ${user.name} (${user.email})`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Department (enum): ${user.department}`);
    console.log(`  Department Master: ${user.departmentMaster?.name || 'None'} (${user.departmentMaster?.code || 'N/A'})`);
    console.log(`  Role Master: ${user.roleMaster?.name || 'None'} (${user.roleMaster?.code || 'N/A'})`);
    console.log('');
  });

  console.log('\n🏢 PMO Department Info:');
  const pmoDept = await prisma.departmentMaster.findUnique({
    where: { code: 'PMO' },
    include: { users: true }
  });
  
  if (pmoDept) {
    console.log(`PMO Department ID: ${pmoDept.id}`);
    console.log(`Users in PMO: ${pmoDept.users.length}`);
    pmoDept.users.forEach(user => {
      console.log(`- ${user.name} (Role: ${user.role})`);
    });
  } else {
    console.log('PMO Department not found!');
  }

  console.log('\n🔍 Testing the actual query (using roleMaster.code):');
  const pmoCoordinators = await prisma.user.findMany({
    where: {
      departmentMaster: {
        code: 'PMO'
      },
      roleMaster: {
        code: {
          in: ['PC', 'PC_TL1', 'PC_TL2']
        }
      }
    },
    include: {
      roleMaster: true,
      departmentMaster: true,
    },
  });

  console.log(`Query result: ${pmoCoordinators.length} users`);
  pmoCoordinators.forEach(user => {
    console.log(`- ${user.name} (Role Master: ${user.roleMaster?.code}, Enum Role: ${user.role})`);
  });

  await prisma.$disconnect();
}

debugUsers().catch(console.error);