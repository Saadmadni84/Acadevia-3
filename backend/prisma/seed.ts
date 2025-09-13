import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.user.deleteMany()
  
  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
    },
  })

  // Create sample posts (if you have a Post model)
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is the content of the first post',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Second Post',
        content: 'This is the content of the second post',
        published: false,
        authorId: user2.id,
      },
    ],
  })

  console.log({ user1, user2 })
  console.log('Database has been seeded! 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })