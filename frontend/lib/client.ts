import { api } from "./api";

// ─── Client ──────────────────────────────────────────────────────────────────

export interface CheckInInput {
  weight: number;
  sleepHours: number;
  energyScore: number;
  moodScore: number;
  workoutsCompleted: number;
  notes?: string;
}

export interface CheckIn {
  id: string;
  clientId: string;
  weekDate: string;
  weight: number;
  sleepHours: number;
  energyScore: number;
  moodScore: number;
  workoutsCompleted: number;
  notes: string | null;
  createdAt: string;
}

export interface ClientMetrics {
  currentWeight: number;
  weightChange: number;
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
}

export interface ClientDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  checkIns: CheckIn[];
  metrics: ClientMetrics;
}

export const submitCheckIn = async (input: CheckInInput): Promise<CheckIn> => {
  const res = await api.post("/client/check-in", input);
  return res.data.data;
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  const res = await api.get("/client/check-ins");
  return res.data.data;
};

export const getCurrentWeekStatus = async (): Promise<{ submitted: boolean }> => {
  const res = await api.get("/client/current-week");
  return res.data.data;
};

export const getClientMetrics = async (): Promise<ClientMetrics> => {
  const res = await api.get("/client/metrics");
  return res.data.data;
};

// ─── Coach ───────────────────────────────────────────────────────────────────

export const getCoachClientDetail = async (clientId: string): Promise<ClientDetail> => {
  const res = await api.get(`/coach/clients/${clientId}`);
  return res.data.data;
};
