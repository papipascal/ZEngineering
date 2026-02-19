import client from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  discipline: string | null;
  phone: string | null;
  title: string | null;
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

  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string;
    discipline?: string;
    title?: string;
  }) => client.patch<User>('/api/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.patch<{ message: string }>('/api/auth/password', data),
};
