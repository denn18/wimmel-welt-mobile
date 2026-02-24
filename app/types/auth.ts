export type AuthUser = {
  id?: string | number | null;
  role?: string | null;
  token?: string | null;
  accessToken?: string | null;
  [key: string]: unknown;
};
