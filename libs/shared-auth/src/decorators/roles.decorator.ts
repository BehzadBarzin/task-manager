import { SetMetadata } from "@nestjs/common";

/**
 * Roles decorator: annotate controller endpoints with required roles.
 * Usage:
 *   @Roles('admin', 'owner') // Define required roles
 *   @UseGuards(JwtAuthGuard, OrgRolesGuard) // Use JwtAuthGuard & OrgRolesGuard to apply authentication & authorization
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
