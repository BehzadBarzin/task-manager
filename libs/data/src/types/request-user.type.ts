/**
 * The user object attached to the request (`req.user`). Populated by `JwtStrategy`.
 */
export type RequestUser = {
  id: string;
  email: string;
  displayName?: string;
};
