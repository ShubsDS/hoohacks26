import { create } from 'zustand';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User } from '@hoohacks26/shared';
import { API_URL } from '../utils/env';
const TOKEN_KEY = 'auth_token';

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    const { data } = await axios.post<{ token: string; user: User }>(
      `${API_URL}/api/auth/login`,
      { email, password }
    );
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      set({ token });
    }
  },
}));
