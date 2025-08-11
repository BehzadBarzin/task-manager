import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * `@CurrentUser` decorator reads `request.user` (populated by `JwtStrategy`).
 * Usage: controller method parameter -> `@CurrentUser() user`
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.user;
  }
);
