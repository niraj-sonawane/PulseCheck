import { prisma } from "./config/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("Connected. Users:", users);
}

main().finally(() => process.exit());