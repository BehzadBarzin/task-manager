import { AuthGuard } from "@nestjs/passport";

/**
 * Wrapper to allow using `@UseGuards(JwtAuthGuard)` in controllers for simplicity
 */
export class JwtAuthGuard extends AuthGuard("jwt") {}
