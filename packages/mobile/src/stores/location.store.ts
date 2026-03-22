import { create } from 'zustand';

interface Coords {
  latitude: number;
  longitude: number;
}

interface LocationStore {
  coords: Coords | null;
  setCoords: (coords: Coords) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  coords: null,
  setCoords: (coords: Coords) => set({ coords }),
}));
