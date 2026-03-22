import { act } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useAuthStore } from '../auth.store';

jest.mock('expo-secure-store');
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset zustand store state between tests
  useAuthStore.setState({ user: null, token: null });
});

describe('auth.store', () => {
  describe('login', () => {
    it('calls the correct endpoint and sets state', async () => {
      const fakeUser = { id: '1', email: 'test@virginia.edu', displayName: 'Test', credibilityScore: 1, isAdmin: false };
      const fakeToken = 'jwt-token-abc';
      mockAxios.post.mockResolvedValueOnce({ data: { token: fakeToken, user: fakeUser } });
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await act(async () => {
        await useAuthStore.getState().login('test@virginia.edu', 'password123');
      });

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        { email: 'test@virginia.edu', password: 'password123' }
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', fakeToken);
      expect(useAuthStore.getState().token).toBe(fakeToken);
      expect(useAuthStore.getState().user).toEqual(fakeUser);
    });

    it('throws on non-2xx response', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('401 Unauthorized'));

      await expect(
        useAuthStore.getState().login('bad@virginia.edu', 'wrong')
      ).rejects.toThrow();

      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears state and removes SecureStore entry', async () => {
      useAuthStore.setState({
        token: 'existing-token',
        user: { id: '1', email: 'a@virginia.edu', displayName: 'A', credibilityScore: 1, isAdmin: false },
      });
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('loadFromStorage', () => {
    it('restores token from SecureStore when one exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce('stored-token');

      await act(async () => {
        await useAuthStore.getState().loadFromStorage();
      });

      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
      expect(useAuthStore.getState().token).toBe('stored-token');
    });

    it('leaves token null when SecureStore has nothing', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      await act(async () => {
        await useAuthStore.getState().loadFromStorage();
      });

      expect(useAuthStore.getState().token).toBeNull();
    });
  });
});
