import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import { useSocket } from '../useSocket';
import { useLocationStore } from '../../stores/location.store';

jest.mock('socket.io-client');

const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockDisconnect = jest.fn();
const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
  off: jest.fn(),
  connected: true,
};
(io as jest.Mock).mockReturnValue(mockSocket);

let alertSpy: jest.SpyInstance;

const triggerSocketEvent = (event: string, data?: any) => {
  const calls = mockOn.mock.calls;
  const handler = calls.find(([e]: [string]) => e === event)?.[1];
  if (handler) handler(data);
};

beforeEach(() => {
  jest.clearAllMocks();
  (io as jest.Mock).mockReturnValue(mockSocket);
  useLocationStore.setState({ coords: null });
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
});

describe('useSocket', () => {
  it('connects to the correct URL', () => {
    const { unmount } = renderHook(() => useSocket('token-abc'));
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ auth: { token: 'token-abc' } })
    );
    unmount();
  });

  it('emits report:subscribe on connect when coords are set', async () => {
    useLocationStore.setState({ coords: { latitude: 38.0336, longitude: -78.508 } });
    const { unmount } = renderHook(() => useSocket('token-abc'));

    await act(async () => {
      triggerSocketEvent('connect');
    });

    expect(mockEmit).toHaveBeenCalledWith('report:subscribe', {
      lat: 38.0336,
      lng: -78.508,
      radius: 2000,
    });
    unmount();
  });

  it('does not emit report:subscribe on connect when no coords', async () => {
    const { unmount } = renderHook(() => useSocket('token-abc'));

    await act(async () => {
      triggerSocketEvent('connect');
    });

    expect(mockEmit).not.toHaveBeenCalledWith('report:subscribe', expect.anything());
    unmount();
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useSocket('token-abc'));
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('calls Alert.alert on admin:broadcast event', async () => {
    const { unmount } = renderHook(() => useSocket('token-abc'));

    await act(async () => {
      triggerSocketEvent('admin:broadcast', { message: 'Emergency!', severity: 'CRITICAL' });
    });

    expect(alertSpy).toHaveBeenCalledWith('Alert [CRITICAL]', 'Emergency!');
    unmount();
  });

  it('calls onReportNew callback when provided', async () => {
    const onReportNew = jest.fn();
    const fakeReport = { id: 'r1', title: 'Test', category: 'CRIME' };
    const { unmount } = renderHook(() => useSocket('token-abc', { onReportNew }));

    await act(async () => {
      triggerSocketEvent('report:new', fakeReport);
    });

    expect(onReportNew).toHaveBeenCalledWith(fakeReport);
    unmount();
  });

  it('calls onReportUpdated callback when provided', async () => {
    const onReportUpdated = jest.fn();
    const fakeReport = { id: 'r1', title: 'Updated' };
    const { unmount } = renderHook(() => useSocket('token-abc', { onReportUpdated }));

    await act(async () => {
      triggerSocketEvent('report:updated', fakeReport);
    });

    expect(onReportUpdated).toHaveBeenCalledWith(fakeReport);
    unmount();
  });

  it('calls onReportResolved callback when provided', async () => {
    const onReportResolved = jest.fn();
    const { unmount } = renderHook(() => useSocket('token-abc', { onReportResolved }));

    await act(async () => {
      triggerSocketEvent('report:resolved', { reportId: 'r1' });
    });

    expect(onReportResolved).toHaveBeenCalledWith('r1');
    unmount();
  });

  it('re-subscribes when coords change by more than 500m', async () => {
    useLocationStore.setState({ coords: { latitude: 38.0336, longitude: -78.508 } });
    const { unmount } = renderHook(() => useSocket('token-abc'));

    await act(async () => {
      triggerSocketEvent('connect');
    });
    mockEmit.mockClear();

    // Move ~600m north (1 degree lat ≈ 111km, so 0.006 degrees ≈ 660m)
    await act(async () => {
      useLocationStore.setState({ coords: { latitude: 38.0396, longitude: -78.508 } });
    });

    expect(mockEmit).toHaveBeenCalledWith('report:subscribe', expect.objectContaining({
      lat: 38.0396,
      lng: -78.508,
      radius: 2000,
    }));
    unmount();
  });

  it('does NOT re-subscribe for small movements under 500m', async () => {
    useLocationStore.setState({ coords: { latitude: 38.0336, longitude: -78.508 } });
    const { unmount } = renderHook(() => useSocket('token-abc'));

    await act(async () => {
      triggerSocketEvent('connect');
    });
    mockEmit.mockClear();

    // Move just ~110m (0.001 degrees lat)
    await act(async () => {
      useLocationStore.setState({ coords: { latitude: 38.0346, longitude: -78.508 } });
    });

    expect(mockEmit).not.toHaveBeenCalledWith('report:subscribe', expect.anything());
    unmount();
  });
});
