import client from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  discipline: string | null;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (data: { email: string; name: string; password: string; role?: string; discipline?: string }) =>
    client.post<AuthResponse>('/api/auth/register', data),

  getMe: () => client.get<User>('/api/auth/me'),
  listUsers: () => client.get<User[]>('/api/auth/users'),
};
