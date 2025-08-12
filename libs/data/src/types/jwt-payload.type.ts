export type JWTPayload = {
  sub: string;
  email: string;
  displayName?: string;
  exp: number;
  iat: number;
};
