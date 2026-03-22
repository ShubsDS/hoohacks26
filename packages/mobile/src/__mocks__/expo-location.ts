const Accuracy = {
  BestForNavigation: 6,
  Highest: 5,
  High: 4,
  Balanced: 3,
  Low: 2,
  Lowest: 1,
};

const mockRemove = jest.fn();
const mockWatcher = { remove: mockRemove };

const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
const watchPositionAsync = jest.fn().mockResolvedValue(mockWatcher);
const getCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: { latitude: 38.0336, longitude: -78.508 },
});

export { Accuracy, requestForegroundPermissionsAsync, watchPositionAsync, getCurrentPositionAsync };
export const __mockWatcher = mockWatcher;
