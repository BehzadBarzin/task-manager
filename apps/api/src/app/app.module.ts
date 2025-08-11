import { MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../tasks/entities/task.entity";
import { Organization } from "../orgs/entities/org.entity";
import { Membership } from "../orgs/entities/membership.entity";
import { AuditLog } from "../audit/entities/audit.entity";
import { TasksModule } from "../tasks/tasks.module";
import { OrgsModule } from "../orgs/orgs.module";
import { AuditModule } from "../audit/audit.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DB_SQLITE_PATH ?? "./data/api.sqlite",
      entities: [Task, Organization, Membership, AuditLog],
      synchronize: true, // dev only
      logging: false,
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    TasksModule,
    OrgsModule,
    AuditModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
