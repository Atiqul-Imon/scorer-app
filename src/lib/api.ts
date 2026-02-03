import { AxiosError } from 'axios';
import { apiClient } from './api-client';
import { logger } from './logger';
import type {
  ApiResponse,
  AuthResponse,
  CreateMatchDto,
  CricketMatch,
  LoginDto,
  MatchFilters,
  PaginatedResponse,
  ScorerRegistrationDto,
  UpdateScoreDto,
  User,
} from '@/types';

// Response interceptor - Handle errors (moved to api-client, but keep redirect logic here)
let isRedirecting = false; // Prevent redirect loops
let redirectCooldown = 0; // Track last redirect time

// Wrap apiClient to add 401 redirect handling
const handle401Redirect = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Unauthorized - clear token
    if (typeof window !== 'undefined' && !isRedirecting) {
      const now = Date.now();
      // Prevent redirects within 2 seconds (cooldown)
      if (now - redirectCooldown < 2000) {
        return;
      }
      
      const currentPath = window.location.pathname;
      // Define public paths that should never redirect
      const publicPaths = ['/login', '/register', '/'];
      const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not on a public page
      if (!isPublicPage) {
        isRedirecting = true;
        redirectCooldown = now;
        // Use replace to avoid adding to history
        window.location.replace('/login');
        // Reset flag after redirect
        setTimeout(() => {
          isRedirecting = false;
        }, 2000);
      }
    }
  }
};

// Helper to wrap API calls with error handling
const apiCall = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (error instanceof AxiosError) {
      handle401Redirect(error);
    }
    throw error;
  }
};

// API methods
export const api = {
  // Authentication
  async login(data: { emailOrPhone: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const payload = {
      emailOrPhone: String(data.emailOrPhone || '').trim(),
      password: String(data.password || '').trim(),
    };
    
    if (!payload.emailOrPhone || !payload.password) {
      throw new Error('Email/Phone and password are required');
    }
    
    return apiCall(() => apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload));
  },

  async registerScorer(data: ScorerRegistrationDto): Promise<ApiResponse<{ scorerId: string; verificationStatus: string }>> {
    return apiCall(() => apiClient.post<ApiResponse<{ scorerId: string; verificationStatus: string }>>('/api/v1/scorer/register', data));
  },

  // Profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiCall(() => apiClient.get<ApiResponse<User>>('/api/v1/scorer/profile'));
  },

  // Matches
  async createMatch(data: CreateMatchDto): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>('/api/v1/cricket/local/matches', data));
  },

  async updateScore(matchId: string, score: UpdateScoreDto): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.put<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/score`,
      score
    ));
  },

  async getMatch(matchId: string): Promise<ApiResponse<CricketMatch>> {
    // Use scorer endpoint to get match (includes unverified matches for the scorer)
    // This allows scorers to access their own matches regardless of verification status
    return apiCall(() => apiClient.get<ApiResponse<CricketMatch>>(`/api/v1/scorer/matches/${matchId}`));
  },

  async updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed' | 'cancelled'): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.put<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/status`,
      { status }
    ));
  },

  async deleteMatch(matchId: string): Promise<void> {
    return apiCall(() => apiClient.delete(`/api/v1/cricket/local/matches/${matchId}`));
  },

  async getScorerMatches(filters?: MatchFilters): Promise<ApiResponse<PaginatedResponse<CricketMatch>>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return apiCall(() => apiClient.get<ApiResponse<PaginatedResponse<CricketMatch>>>(
      `/api/v1/scorer/matches?${params.toString()}`
    ));
  },

  async getLocalMatches(filters?: {
    city?: string;
    district?: string;
    area?: string;
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<CricketMatch[]>> {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.district) params.append('district', filters.district);
    if (filters?.area) params.append('area', filters.area);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiCall(() => apiClient.get<ApiResponse<CricketMatch[]>>(
      `/api/v1/cricket/local/matches?${params.toString()}`
    ));
  },

  // Match Setup
  async completeMatchSetup(matchId: string, setupData: any): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/setup`,
      setupData
    ));
  },

  // Ball-by-ball scoring
  async recordBall(matchId: string, ballData: any): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/ball`,
      ballData
    ));
  },

  async undoLastBall(matchId: string): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/undo`
    ));
  },

  // Second innings
  async startSecondInnings(
    matchId: string,
    data: { openingBatter1Id: string; openingBatter2Id: string; firstBowlerId: string }
  ): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/second-innings`,
      data
    ));
  },

  // Complete match
  async completeMatch(
    matchId: string,
    data: {
      winner?: 'home' | 'away' | 'tie' | 'no_result';
      margin?: string;
      keyPerformers?: Array<{ playerId: string; playerName: string; role: string; performance: string }>;
      notes?: string;
    }
  ): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.post<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/complete`,
      data
    ));
  },

  // Update live state (current players, over, ball)
  async updateLiveState(matchId: string, data: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    currentOver?: number;
    currentBall?: number;
  }): Promise<ApiResponse<CricketMatch>> {
    return apiCall(() => apiClient.put<ApiResponse<CricketMatch>>(
      `/api/v1/cricket/local/matches/${matchId}/live-state`,
      data
    ));
  },
};

export default api;
