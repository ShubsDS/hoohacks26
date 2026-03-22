import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { Report, Severity } from '@hoohacks26/shared';
import { useLocationStore } from '../stores/location.store';
import { SOCKET_SUBSCRIPTION_RADIUS, RESUBSCRIBE_DISTANCE_THRESHOLD_M } from '../constants/map';
import { SOCKET_URL } from '../utils/env';

function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface SocketCallbacks {
  onReportNew?: (report: Report) => void;
  onReportUpdated?: (report: Report) => void;
  onReportResolved?: (reportId: string) => void;
}

export function useSocket(token: string | null, callbacks?: SocketCallbacks) {
  const coords = useLocationStore((s) => s.coords);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastSubRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (coords) {
        socket.emit('report:subscribe', {
          lat: coords.latitude,
          lng: coords.longitude,
          radius: SOCKET_SUBSCRIPTION_RADIUS,
        });
        lastSubRef.current = { lat: coords.latitude, lng: coords.longitude };
      }
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('report:new', (report: Report) => {
      if (callbacks?.onReportNew) {
        callbacks.onReportNew(report);
      } else {
        console.log('[socket] report:new', report.id);
      }
    });

    socket.on('report:updated', (report: Report) => {
      if (callbacks?.onReportUpdated) {
        callbacks.onReportUpdated(report);
      } else {
        console.log('[socket] report:updated', report.id);
      }
    });

    socket.on('report:resolved', ({ reportId }: { reportId: string }) => {
      if (callbacks?.onReportResolved) {
        callbacks.onReportResolved(reportId);
      } else {
        console.log('[socket] report:resolved', reportId);
      }
    });

    socket.on('admin:broadcast', ({ message, severity }: { message: string; severity: Severity }) => {
      Alert.alert(`Alert [${severity}]`, message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Re-subscribe when user moves beyond threshold
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !coords) return;

    const last = lastSubRef.current;
    if (!last) {
      socket.emit('report:subscribe', {
        lat: coords.latitude,
        lng: coords.longitude,
        radius: SOCKET_SUBSCRIPTION_RADIUS,
      });
      lastSubRef.current = { lat: coords.latitude, lng: coords.longitude };
      return;
    }

    const dist = distanceMeters(last.lat, last.lng, coords.latitude, coords.longitude);
    if (dist > RESUBSCRIBE_DISTANCE_THRESHOLD_M) {
      socket.emit('report:subscribe', {
        lat: coords.latitude,
        lng: coords.longitude,
        radius: SOCKET_SUBSCRIPTION_RADIUS,
      });
      lastSubRef.current = { lat: coords.latitude, lng: coords.longitude };
    }
  }, [coords]);

  return { connected };
}
