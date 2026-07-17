import { prisma } from "../config/prisma";

export interface CheckInInput {
  weight: number;
  sleepHours: number;
  energyScore: number;
  moodScore: number;
  workoutsCompleted: number;
  notes?: string;
}

// Helper to get the start of the calendar week (Monday 00:00:00)
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust to Monday: if Sunday (0), go back 6 days, otherwise go back (day - 1) days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function findClientProfileByUserId(userId: string) {
  const client = await prisma.client.findUnique({
    where: { userId }
  });
  if (!client) {
    const error: { message: string; statusCode: number } = {
      message: "Client profile not found",
      statusCode: 404
    };
    throw error;
  }
  return client;
}

export async function hasSubmittedThisWeek(clientId: string, date: Date = new Date()): Promise<boolean> {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const existing = await prisma.checkIn.findFirst({
    where: {
      clientId,
      weekDate: {
        gte: startOfWeek,
        lt: endOfWeek
      }
    }
  });

  return !!existing;
}

export async function createCheckIn(clientId: string, input: CheckInInput) {
  // ── Input validation (returns 400 for out-of-range values) ────────────────
  const validationErrors: string[] = [];

  if (typeof input.weight !== "number" || isNaN(input.weight) || input.weight <= 0) {
    validationErrors.push("Weight must be a positive number greater than 0.");
  }
  if (typeof input.sleepHours !== "number" || isNaN(input.sleepHours) || input.sleepHours < 0 || input.sleepHours > 24) {
    validationErrors.push("Sleep hours must be a number between 0 and 24.");
  }
  if (typeof input.energyScore !== "number" || isNaN(input.energyScore) || !Number.isInteger(input.energyScore) || input.energyScore < 1 || input.energyScore > 10) {
    validationErrors.push("Energy score must be an integer between 1 and 10.");
  }
  if (typeof input.moodScore !== "number" || isNaN(input.moodScore) || !Number.isInteger(input.moodScore) || input.moodScore < 1 || input.moodScore > 10) {
    validationErrors.push("Mood score must be an integer between 1 and 10.");
  }
  if (typeof input.workoutsCompleted !== "number" || isNaN(input.workoutsCompleted) || !Number.isInteger(input.workoutsCompleted) || input.workoutsCompleted < 0) {
    validationErrors.push("Workouts completed must be a non-negative integer.");
  }
  if (input.notes && (typeof input.notes !== "string" || input.notes.length > 2000)) {
    validationErrors.push("Notes must be a string and cannot exceed 2000 characters.");
  }

  if (validationErrors.length > 0) {
    const error: { message: string; statusCode: number } = {
      message: validationErrors.join(" "),
      statusCode: 400
    };
    throw error;
  }

  // ── Duplicate week check ───────────────────────────────────────────────────
  const submitted = await hasSubmittedThisWeek(clientId);
  if (submitted) {
    const error: { message: string; statusCode: number } = {
      message: "You have already submitted this week's check-in.",
      statusCode: 409
    };
    throw error;
  }

  return await prisma.checkIn.create({
    data: {
      clientId,
      weekDate: new Date(),
      weight: input.weight,
      sleepHours: input.sleepHours,
      energyScore: input.energyScore,
      moodScore: input.moodScore,
      workoutsCompleted: input.workoutsCompleted,
      notes: input.notes || null
    }
  });
}

export async function getClientCheckIns(clientId: string) {
  return await prisma.checkIn.findMany({
    where: { clientId },
    orderBy: { weekDate: "desc" },
    take: 52 // Limit history to last 52 check-ins to prevent payload bloat
  });
}

export async function getClientMetrics(clientId: string, prefetchedCheckIns?: any[]) {
  const checkIns = prefetchedCheckIns
    ? [...prefetchedCheckIns].sort((a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime())
    : await prisma.checkIn.findMany({
        where: { clientId },
        orderBy: { weekDate: "asc" }
      });

  const totalCheckIns = checkIns.length;
  if (totalCheckIns === 0) {
    return {
      currentWeight: 0,
      weightChange: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalCheckIns: 0
    };
  }

  const currentWeight = checkIns[totalCheckIns - 1].weight;
  // Weight change compared to the first check-in (starting weight)
  const weightChange = totalCheckIns > 1 ? currentWeight - checkIns[0].weight : 0;

  // Streak Calculation (Monday-based calendar weeks)
  const weekTimestamps = checkIns.map((c) => getStartOfWeek(c.weekDate).getTime());
  const uniqueWeekTimestamps = Array.from(new Set(weekTimestamps)).sort((a, b) => b - a); // Descending (newest first)

  let currentStreak = 0;
  let bestStreak = 0;

  if (uniqueWeekTimestamps.length > 0) {
    const currentWeekMonday = getStartOfWeek(new Date()).getTime();
    const lastCheckInMonday = uniqueWeekTimestamps[0];
    const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

    // A streak is active if the client has checked in this calendar week OR last calendar week
    const isStreakActive = (currentWeekMonday - lastCheckInMonday) <= MS_IN_WEEK;

    if (isStreakActive) {
      currentStreak = 1;
      let expectedMonday = lastCheckInMonday - MS_IN_WEEK;
      
      for (let i = 1; i < uniqueWeekTimestamps.length; i++) {
        if (uniqueWeekTimestamps[i] === expectedMonday) {
          currentStreak++;
          expectedMonday -= MS_IN_WEEK;
        } else {
          break; // Streak broken
        }
      }
    }

    // Calculate Best Streak
    let tempStreak = 1;
    for (let i = 0; i < uniqueWeekTimestamps.length - 1; i++) {
      if (uniqueWeekTimestamps[i] - uniqueWeekTimestamps[i + 1] === MS_IN_WEEK) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  return {
    currentWeight,
    weightChange: Number(weightChange.toFixed(1)),
    currentStreak,
    bestStreak,
    totalCheckIns
  };
}
