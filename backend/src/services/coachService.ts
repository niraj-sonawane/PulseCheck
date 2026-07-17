import { prisma } from "../config/prisma";
import { getClientMetrics } from "./clientService";

export const getCoachClients = async (coachId: string) => {
  const clients = await prisma.client.findMany({
    where: { coachId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      checkIns: {
        orderBy: { weekDate: "desc" },
        take: 1,
      },
      alerts: {
        where: { resolved: false },
      },
    },
  });

  return clients.map((client) => ({
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    lastCheckIn: client.checkIns[0]?.weekDate || null,
    alertCount: client.alerts.length,
    status: client.checkIns[0]
      ? daysSince(client.checkIns[0].weekDate) <= 7
        ? "checked"
        : "missing"
      : "missing",
  }));
};

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export const addClient = async (coachId: string, clientEmail: string) => {
  const clientUser = await prisma.user.findUnique({
    where: { email: clientEmail },
  });

  if (!clientUser) {
    throw new Error("No user found with that email");
  }

  if (clientUser.role !== "CLIENT") {
    throw new Error("That user is not registered as a client");
  }

  const existing = await prisma.client.findFirst({
    where: { coachId, userId: clientUser.id },
  });

  if (existing) {
    throw new Error("Client already added");
  }

  const client = await prisma.client.create({
    data: {
      coachId,
      userId: clientUser.id,
    },
  });

  return client;
};

export const getCoachClientDetail = async (coachId: string, clientId: string) => {
  const client = await prisma.client.findFirst({
    where: { id: clientId, coachId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      checkIns: {
        orderBy: { weekDate: "desc" },
        take: 52, // Limit history to last 52 check-ins to prevent database and network payload bloat
      },
    },
  });

  if (!client) {
    const error: { message: string; statusCode: number } = {
      message: "Client not found or not authorized.",
      statusCode: 404
    };
    throw error;
  }

  // Calculate metrics
  const metrics = await getClientMetrics(client.id, client.checkIns);

  return {
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    createdAt: client.createdAt,
    checkIns: client.checkIns,
    metrics
  };
};