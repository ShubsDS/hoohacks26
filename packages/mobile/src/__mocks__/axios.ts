const mockPost = jest.fn().mockResolvedValue({ data: {} });
const mockGet = jest.fn().mockResolvedValue({ data: {} });
const mockDelete = jest.fn().mockResolvedValue({ data: {} });
const mockPatch = jest.fn().mockResolvedValue({ data: {} });

const axios = {
  post: mockPost,
  get: mockGet,
  delete: mockDelete,
  patch: mockPatch,
  create: jest.fn(() => axios),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

export default axios;
export { mockPost, mockGet, mockDelete, mockPatch };
export const __reset = () => {
  mockPost.mockReset().mockResolvedValue({ data: {} });
  mockGet.mockReset().mockResolvedValue({ data: {} });
  mockDelete.mockReset().mockResolvedValue({ data: {} });
  mockPatch.mockReset().mockResolvedValue({ data: {} });
};
