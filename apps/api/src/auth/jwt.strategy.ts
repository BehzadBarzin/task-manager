import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { type RequestUser, type JWTPayload } from "@task-manager/data";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "dev_secret",
      ignoreExpiration: false,
    });
  }

  /**
   * Validates the JWT payload and returns the authenticated user object for Passport.
   *
   * This method is called automatically after JWT verification. It must return a `user` object
   * containing essential identification properties (e.g., `userId`) that will be attached to
   * `req.user`.
   *
   * @param payload decoded payload from JWT token
   * @returns the `req.user` object available in the route handlers
   */
  async validate(payload: JWTPayload): Promise<RequestUser> {
    // Payload defined in `apps/auth/src/auth/auth.service.ts` → `login()`
    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
    };
  }
}
