import { useLocationStore } from '../location.store';

beforeEach(() => {
  useLocationStore.setState({ coords: null });
});

describe('location.store', () => {
  it('starts with null coords', () => {
    expect(useLocationStore.getState().coords).toBeNull();
  });

  it('setCoords updates state', () => {
    useLocationStore.getState().setCoords({ latitude: 38.0336, longitude: -78.508 });
    expect(useLocationStore.getState().coords).toEqual({ latitude: 38.0336, longitude: -78.508 });
  });

  it('setCoords overwrites previous value', () => {
    useLocationStore.getState().setCoords({ latitude: 38.0336, longitude: -78.508 });
    useLocationStore.getState().setCoords({ latitude: 37.0, longitude: -77.0 });
    expect(useLocationStore.getState().coords).toEqual({ latitude: 37.0, longitude: -77.0 });
  });
});
