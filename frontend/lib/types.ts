// Shared types used across frontend pages

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "COACH" | "CLIENT";
}
