import { Module } from "@nestjs/common";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "./entities/audit.entity";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { RolesGuardFactory } from "@task-manager/shared-auth";
import { Membership } from "../orgs/entities/membership.entity";
import { Reflector } from "@nestjs/core";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Membership])],
  providers: [
    AuditService,
    // create concrete guard instance for this module wired to the membership repo
    {
      provide: "ORG_ROLES_GUARD_INSTANCE",
      useFactory: (membershipsRepo, reflector: Reflector) => {
        const GuardClass = RolesGuardFactory(
          async (userId: string, orgId: string) =>
            membershipsRepo.findOne({ where: { userId, orgId } })
        );
        return new GuardClass(reflector);
      },
      inject: [getRepositoryToken(Membership), Reflector],
    },
  ],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
