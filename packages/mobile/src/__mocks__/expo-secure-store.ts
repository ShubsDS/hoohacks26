const store: Record<string, string> = {};

const getItemAsync = jest.fn((key: string) => Promise.resolve(store[key] ?? null));
const setItemAsync = jest.fn((key: string, value: string) => {
  store[key] = value;
  return Promise.resolve();
});
const deleteItemAsync = jest.fn((key: string) => {
  delete store[key];
  return Promise.resolve();
});

const __reset = () => {
  Object.keys(store).forEach((k) => delete store[k]);
  getItemAsync.mockClear();
  setItemAsync.mockClear();
  deleteItemAsync.mockClear();
};

export { getItemAsync, setItemAsync, deleteItemAsync, __reset };
