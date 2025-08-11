import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { Membership } from "../orgs/entities/membership.entity";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { AuditModule } from "../audit/audit.module";
import { Reflector } from "@nestjs/core";
import { RolesGuardFactory } from "@task-manager/shared-auth";
import { getRepositoryToken } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Task, Membership]), AuditModule],
  controllers: [TasksController],
  providers: [
    TasksService,
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
  exports: [TasksService],
})
export class TasksModule {}
