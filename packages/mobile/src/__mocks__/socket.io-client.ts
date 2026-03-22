const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockDisconnect = jest.fn();
const mockOff = jest.fn();

const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
  off: mockOff,
  connected: true,
};

export const io = jest.fn(() => mockSocket);

export const __mockSocket = mockSocket;
export const __reset = () => {
  mockOn.mockClear();
  mockEmit.mockClear();
  mockDisconnect.mockClear();
  mockOff.mockClear();
  (io as jest.Mock).mockClear();
};
