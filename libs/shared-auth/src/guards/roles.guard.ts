import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  mixin,
  Type,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

/**
 * `RolesGuardFactory` builds a guard class which, when instantiated, will
 * call the supplied `getMembershipForUserInOrg(userId, orgId)` function to resolve
 * the requesting user's `membership` & `role` in the organization.
 *
 * This design keeps the library free of DB framework specifics; apps
 * pass a resolver that uses their ORM/repo.
 *
 * Returned class (mixin) needs a Reflector passed via constructor.
 */
export function RolesGuardFactory(
  getMembershipForUserInOrg: (
    userId: string,
    orgId: string
  ) => Promise<{ role: string } | null>
) {
  @Injectable()
  class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      // Get required roles for the endpoint (provided via @Roles decorator. Example: @Roles('admin', 'owner'))
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()]
      );
      // If no roles required (didn't use @Roles), allow access
      if (!requiredRoles || requiredRoles.length === 0) return true;

      // Get user from request (populated by `JwtStrategy` guard)
      const req = context.switchToHttp().getRequest();
      const user = req.user;
      if (!user) throw new ForbiddenException("Unauthenticated");

      // Extract `orgId` from common places - params, body, query
      const orgId = req.params?.orgId || req.body?.orgId || req.query?.orgId;
      if (!orgId) throw new ForbiddenException("Organization context required");

      // Get membership for user in org (using the supplied resolver function to this factory)
      const membership = await getMembershipForUserInOrg(user.id, orgId);
      if (!membership)
        throw new ForbiddenException("Not a member of organization");

      const role = membership.role; // User has this role in the org

      // simple inheritance: viewer < admin < owner
      // we treat roles by index so higher index means more privileges
      const hierarchy = ["viewer", "admin", "owner"];
      const userRank = hierarchy.indexOf(role);
      if (userRank < 0) throw new ForbiddenException("Unknown role");

      // If any required role has rank <= userRank, allow.
      const allowed = requiredRoles.some((r) => {
        const requiredRank = hierarchy.indexOf(r);
        return userRank >= requiredRank;
      });

      if (!allowed) throw new ForbiddenException("Insufficient role");

      return true;
    }
  }

  // Return the dynamic class (mixin) type
  return mixin(RolesGuard) as Type<CanActivate>;
}
