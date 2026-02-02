import axios, { AxiosError, AxiosInstance } from 'axios';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000, // Reduced to 10 seconds to prevent long hangs
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
let isRedirecting = false; // Prevent redirect loops
let redirectCooldown = 0; // Track last redirect time

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token
      if (typeof window !== 'undefined' && !isRedirecting) {
        const now = Date.now();
        // Prevent redirects within 2 seconds (cooldown)
        if (now - redirectCooldown < 2000) {
          return Promise.reject(error);
        }
        
        const currentPath = window.location.pathname;
        // Only redirect if not already on login/register/home page
        // Also skip redirect if we're on a public route
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') && 
            currentPath !== '/') {
          isRedirecting = true;
          redirectCooldown = now;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Use replace to avoid adding to history
          window.location.replace('/login');
          // Reset flag after redirect
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        } else {
          // Already on auth page, just clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Authentication
  async login(data: { emailOrPhone: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    // Ensure we only send emailOrPhone, not email - explicitly construct the payload
    const payload = {
      emailOrPhone: String(data.emailOrPhone || '').trim(),
      password: String(data.password || '').trim(),
    };
    
    // Remove any undefined or null values
    if (!payload.emailOrPhone || !payload.password) {
      throw new Error('Email/Phone and password are required');
    }
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data;
  },

  async registerScorer(data: ScorerRegistrationDto): Promise<ApiResponse<{ scorerId: string; verificationStatus: string }>> {
    const response = await apiClient.post('/scorer/register', data);
    return response.data;
  },

  // Profile
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/scorer/profile');
    return response.data;
  },

  // Matches
  async createMatch(data: CreateMatchDto): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.post<ApiResponse<CricketMatch>>('/cricket/local/matches', data);
    return response.data;
  },

  async updateScore(matchId: string, score: UpdateScoreDto): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.put<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/score`,
      score
    );
    return response.data;
  },

  async getMatch(matchId: string): Promise<ApiResponse<CricketMatch>> {
    // Use scorer endpoint to get match (includes unverified matches for the scorer)
    // This allows scorers to access their own matches regardless of verification status
    const response = await apiClient.get<ApiResponse<CricketMatch>>(`/scorer/matches/${matchId}`);
    return response.data;
  },

  async getScorerMatches(filters?: MatchFilters): Promise<ApiResponse<PaginatedResponse<CricketMatch>>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<CricketMatch>>>(
      `/scorer/matches?${params.toString()}`
    );
    return response.data;
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

    const response = await apiClient.get<ApiResponse<CricketMatch[]>>(
      `/cricket/local/matches?${params.toString()}`
    );
    return response.data;
  },

  // Match Setup
  async completeMatchSetup(matchId: string, setupData: any): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.post<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/setup`,
      setupData
    );
    return response.data;
  },

  // Ball-by-ball scoring
  async recordBall(matchId: string, ballData: any): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.post<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/ball`,
      ballData
    );
    return response.data;
  },

  async undoLastBall(matchId: string): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.post<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/undo`
    );
    return response.data;
  },

  // Second innings
  async startSecondInnings(
    matchId: string,
    data: { openingBatter1Id: string; openingBatter2Id: string; firstBowlerId: string }
  ): Promise<ApiResponse<CricketMatch>> {
    const response = await apiClient.post<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/second-innings`,
      data
    );
    return response.data;
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
    const response = await apiClient.post<ApiResponse<CricketMatch>>(
      `/cricket/local/matches/${matchId}/complete`,
      data
    );
    return response.data;
  },
};

export default apiClient;



