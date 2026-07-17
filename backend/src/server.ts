import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "" || process.env.JWT_SECRET === "your_random_secret_here") {
  console.error("FATAL ERROR: JWT_SECRET is not configured or is set to a default placeholder value.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Prisma disconnected. Server shut down.");
      process.exit(0);
    } catch (err) {
      console.error("Error during Prisma disconnect:", err);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
