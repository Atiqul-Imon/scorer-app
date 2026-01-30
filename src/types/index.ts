// User and Scorer Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator' | 'scorer';
  scorerProfile?: ScorerProfile;
}

export interface ScorerProfile {
  isScorer: boolean;
  scorerId: string;
  scorerType: 'official' | 'volunteer' | 'community';
  verificationStatus: 'pending' | 'verified' | 'suspended';
  location?: {
    city: string;
    district?: string;
    area?: string;
  };
  matchesScored: number;
  accuracyScore: number;
  assignedLeagues: string[];
}

// Match Types
export interface CricketMatch {
  matchId: string;
  series: string;
  matchType: 'international' | 'franchise' | 'local' | 'hyper-local';
  isLocalMatch: boolean;
  teams: {
    home: Team;
    away: Team;
  };
  venue: Venue;
  status: 'live' | 'completed' | 'upcoming' | 'cancelled';
  format: 'test' | 'odi' | 't20i' | 't20' | 'first-class' | 'list-a';
  startTime: string;
  endTime?: string;
  currentScore?: Score;
  localLocation?: Location;
  localLeague?: League;
  scorerInfo?: ScorerInfo;
  isVerified: boolean;
  matchNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  flag?: string;
  shortName: string;
}

export interface Venue {
  name: string;
  city: string;
  country: string;
  address?: string;
}

export interface Score {
  home: TeamScore;
  away: TeamScore;
}

export interface TeamScore {
  runs: number;
  wickets: number;
  overs: number;
  balls?: number;
}

export interface Location {
  country: string;
  state?: string;
  city: string;
  district?: string;
  area?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface League {
  id: string;
  name: string;
  level: 'national' | 'state' | 'district' | 'city' | 'ward' | 'club';
  season: string;
  year: number;
}

export interface ScorerInfo {
  scorerId: string;
  scorerName: string;
  scorerType: 'official' | 'volunteer' | 'automated';
  lastUpdate: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// DTOs
export interface ScorerRegistrationDto {
  name: string;
  phone: string;
  email?: string;
  location: {
    city: string;
    district?: string;
    area?: string;
  };
  scorerType: 'official' | 'volunteer' | 'community';
  termsAccepted: boolean;
}

export interface CreateMatchDto {
  series: string;
  format: 't20' | 'odi' | 'test' | 'first-class' | 'list-a';
  startTime: string;
  venue: {
    name: string;
    city: string;
    address?: string;
  };
  teams: {
    home: string;
    away: string;
  };
  league?: {
    id: string;
    name: string;
    level: string;
    season: string;
    year: number;
  };
  location: {
    country: string;
    city: string;
    district?: string;
    area?: string;
  };
}

export interface UpdateScoreDto {
  home: {
    runs: number;
    wickets: number;
    overs: number;
    balls?: number;
  };
  away: {
    runs: number;
    wickets: number;
    overs: number;
    balls?: number;
  };
  matchNote?: string;
  innings?: number;
}

export interface MatchFilters {
  status?: 'upcoming' | 'live' | 'completed';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

