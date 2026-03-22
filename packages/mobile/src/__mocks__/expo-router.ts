const push = jest.fn();
const replace = jest.fn();
const back = jest.fn();

export const router = { push, replace, back };

export const useRouter = jest.fn(() => router);

export const useLocalSearchParams = jest.fn(() => ({}));

export const Redirect = jest.fn(({ href }: { href: string }) => {
  return null;
});

export const Link = jest.fn(({ children }: { children: React.ReactNode }) => children);

export const Stack = {
  Screen: jest.fn(() => null),
};

export const Tabs = {
  Screen: jest.fn(() => null),
};
