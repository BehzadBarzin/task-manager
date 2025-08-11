import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "./entities/org.entity";
import { Membership } from "./entities/membership.entity";
import { OrgsService } from "./orgs.service";
import { OrgsController } from "./orgs.controller";
import { AuditModule } from "../audit/audit.module";
import { Reflector } from "@nestjs/core";
import { RolesGuardFactory } from "@task-manager/shared-auth";
import { getRepositoryToken } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Membership]), AuditModule],
  providers: [
    OrgsService,
    // provide a concrete OrgRolesGuard instance used elsewhere via DI
    {
      provide: "ORG_ROLES_GUARD_INSTANCE",
      useFactory: (membershipsRepo, reflector: Reflector) => {
        // create the mixin guard class and instantiate it with the reflector
        const GuardClass = RolesGuardFactory(
          async (userId: string, orgId: string) =>
            membershipsRepo.findOne({ where: { userId, orgId } })
        );
        return new GuardClass(reflector);
      },
      inject: [getRepositoryToken(Membership), Reflector],
    },
    // The file ../guards/org-roles.guard will wrap this provider to be injectable
  ],
  controllers: [OrgsController],
  exports: [OrgsService],
})
export class OrgsModule {}
