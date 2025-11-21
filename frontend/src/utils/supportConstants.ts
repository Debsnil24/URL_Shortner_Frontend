export const FIELD_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 1, max: 255 },
  message: { min: 1, max: 5000 },
} as const;

export type SupportField = "name" | "email" | "message";

