import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (partialUser: Partial<User>) => void;
  logout: () => void;
}

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  if (user.name && user.name.trim()) return user.name;
  if (!user.email) return 'User';
  const handle = user.email.split('@')[0];
  if (handle.toLowerCase() === 'nethigreeshma') return 'Greeshma Nethi';
  const parts = handle.split(/[\._\-\d]+/);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || handle;
};

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  updateUser: (partialUser) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...partialUser } : null;
      if (updated) localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));
