export interface User {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  daysPerWeek: number;
  booksPerMonth: number;
  minutesPerSession: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string | null;
  timezone?: string;
}

export interface UpdateGoalsRequest {
  daysPerWeek?: number;
  booksPerMonth?: number;
  minutesPerSession?: number;
}
