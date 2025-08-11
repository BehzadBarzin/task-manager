import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "@task-manager/shared-auth";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrgRolesGuard } from "../guards/org-roles.guard";
import { Role } from "../orgs/enums/roles.enum";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("audit-logs")
export class AuditController {
  // -----------------------------------------------------------------------------------------------
  constructor(private audit: AuditService) {}

  // -----------------------------------------------------------------------------------------------
  // GET /audit-logs?orgId=... → List audit logs by org
  @Get()
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiBearerAuth()
  async list(@Query("orgId") orgId: string) {
    return this.audit.listByOrg(orgId, 50);
  }

  // -----------------------------------------------------------------------------------------------
}
