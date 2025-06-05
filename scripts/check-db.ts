import { PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()

  try {
    // Test database connection
    await prisma.$connect()
    console.log("✅ Database connection successful")

    // Count users as a simple query test
    const userCount = await prisma.user.count()
    console.log(`Found ${userCount} users in the database`)
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
