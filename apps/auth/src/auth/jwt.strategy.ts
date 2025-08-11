import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

/**
 * JwtStrategy used by the auth service itself when guarding routes inside auth
 * (not used by other services). It validates tokens signed with the same secret.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev_secret",
    });
  }

  async validate(payload: any) {
    // Payload contains `sub`, `email`, `name` from AuthService.sign()
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
