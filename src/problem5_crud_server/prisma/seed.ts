import { Author, PrismaClient, Resource, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Seeding Users...');

  const users = [
    {
      email: 'anh@test.com',
      name: 'Anh1',
      password: '$2a$08$hJnASNpOzYdNwuiw3qs4LulSCZpK8e3nSOmIfoEMoV86qIuf6BY1e',
      role: Role.USER,
      isEmailVerified: true
    },
    {
      email: 'anh2@test.com',
      name: 'Anh2',
      password: '$2a$08$fOzVR6ye9ibgQ5JabWfnte3G6oGveG3UA2hUIsry1St/UlA.S9meK',
      role: Role.ADMIN,
      isEmailVerified: true
    }
  ];

  const createdUsers = await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      })
    )
  );

  console.log('✅ Users seeded successfully!');
  return createdUsers;
}

async function seedAuthors() {
  console.log('🌱 Seeding Authors...');

  const authors: Author[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const createdAuthors = await Promise.all(
    authors.map((author) => prisma.author.create({ data: author }))
  );

  console.log('✅ Authors seeded successfully!');
  return createdAuthors;
}

async function seedResources() {
  console.log('🌱 Seeding Resources...');

  const resources: Resource[] = [
    {
      id: 1,
      name: 'Test Resource 1',
      description: 'This is a test resource 1',
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Test Resource 2',
      description: 'This is a test resource 2',
      authorId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await Promise.all(resources.map((resource) => prisma.resource.create({ data: resource })));

  console.log('✅ Resources seeded successfully!');
}

async function main() {
  console.log('🚀 Starting database seeding...');

  await seedUsers();
  await seedAuthors();
  await seedResources();

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
