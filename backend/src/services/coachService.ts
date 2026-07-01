import { prisma } from "../config/prisma";

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