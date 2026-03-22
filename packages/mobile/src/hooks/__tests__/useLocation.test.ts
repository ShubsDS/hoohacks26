import { renderHook, act } from '@testing-library/react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useLocation } from '../useLocation';
import { useLocationStore } from '../../stores/location.store';

jest.mock('expo-location');
jest.mock('axios');

const mockLocation = Location as jest.Mocked<typeof Location>;
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockRemove = jest.fn();
const mockWatcher = { remove: mockRemove };

beforeEach(() => {
  jest.clearAllMocks();
  useLocationStore.setState({ coords: null });
  mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' });
  mockLocation.watchPositionAsync.mockResolvedValue(mockWatcher as any);
  mockAxios.post.mockResolvedValue({ data: {} });
  mockAxios.delete.mockResolvedValue({ data: {} });
});

describe('useLocation', () => {
  it('requests foreground permissions on mount', async () => {
    const { unmount } = renderHook(() => useLocation('token-123'));
    await act(async () => {});
    expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('returns permissionGranted=true when permission granted', async () => {
    const { result } = renderHook(() => useLocation('token-123'));
    await act(async () => {});
    expect(result.current.permissionGranted).toBe(true);
  });

  it('returns permissionGranted=false when permission denied', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied', granted: false, canAskAgain: false, expires: 'never' });
    const { result } = renderHook(() => useLocation('token-123'));
    await act(async () => {});
    expect(result.current.permissionGranted).toBe(false);
  });

  it('calls watchPositionAsync with correct accuracy and interval', async () => {
    const { unmount } = renderHook(() => useLocation('token-123'));
    await act(async () => {});
    expect(mockLocation.watchPositionAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
      }),
      expect.any(Function)
    );
    unmount();
  });

  it('calls setCoords and POSTs to API on location update', async () => {
    let locationCallback: ((loc: any) => void) | undefined;
    mockLocation.watchPositionAsync.mockImplementationOnce(async (_opts, cb) => {
      locationCallback = cb;
      return mockWatcher as any;
    });

    const { unmount } = renderHook(() => useLocation('token-123'));
    await act(async () => {});

    expect(locationCallback).toBeDefined();
    await act(async () => {
      locationCallback!({ coords: { latitude: 38.0336, longitude: -78.508 } });
    });

    expect(useLocationStore.getState().coords).toEqual({ latitude: 38.0336, longitude: -78.508 });
    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/location/update'),
      { lat: 38.0336, lng: -78.508 },
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    unmount();
  });

  it('removes watcher and DELETEs location on unmount', async () => {
    const { unmount } = renderHook(() => useLocation('token-123'));
    await act(async () => {});
    unmount();
    await act(async () => {});
    expect(mockRemove).toHaveBeenCalled();
    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/location'),
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
  });

  it('does not POST location update when token is null', async () => {
    let locationCallback: ((loc: any) => void) | undefined;
    mockLocation.watchPositionAsync.mockImplementationOnce(async (_opts, cb) => {
      locationCallback = cb;
      return mockWatcher as any;
    });

    const { unmount } = renderHook(() => useLocation(null));
    await act(async () => {});
    await act(async () => {
      locationCallback?.({ coords: { latitude: 38.0, longitude: -78.0 } });
    });

    expect(mockAxios.post).not.toHaveBeenCalled();
    unmount();
  });
});
