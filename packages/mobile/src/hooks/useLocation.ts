import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { useLocationStore } from '../stores/location.store';
import { API_URL } from '../utils/env';

export function useLocation(token: string | null) {
  const setCoords = useLocationStore((s) => s.setCoords);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let active = true;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      if (status !== 'granted') return;
      setPermissionGranted(true);

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCoords({ latitude, longitude });

          if (token) {
            axios
              .post(
                `${API_URL}/api/location/update`,
                { lat: latitude, lng: longitude },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch(() => {});
          }
        }
      );
      watcherRef.current = watcher;
    }

    start();

    return () => {
      active = false;
      watcherRef.current?.remove();
      watcherRef.current = null;
      if (token) {
        axios
          .delete(`${API_URL}/api/location`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => {});
      }
    };
  }, [token]);

  return { permissionGranted };
}
