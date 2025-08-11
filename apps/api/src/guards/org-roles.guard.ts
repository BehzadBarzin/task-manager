import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";

/**
 * `OrgRolesGuard` acts as an injectable, module-scoped guard that delegates
 * to the dynamically created guard instance produced by RolesGuardFactory.
 *
 * The provider 'ORG_ROLES_GUARD_INSTANCE' is registered in TasksModule/OrgsModule
 * and contains an instance of the mixin guard (constructed with Reflector).
 *
 * This wrapper is simple: it receives the instance via DI and calls its canActivate.
 */
@Injectable()
export class OrgRolesGuard implements CanActivate {
  // Inject the guard instance created by `RolesGuardFactory` in module file (e.g. `tasks.module.ts`)
  constructor(@Inject("ORG_ROLES_GUARD_INSTANCE") private inner: any) {}

  async canActivate(context: ExecutionContext) {
    // Delegate to mixin guard
    return this.inner.canActivate(context as any);
  }
}
