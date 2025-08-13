import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "@task-manager/shared-auth";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrgRolesGuard } from "../guards/org-roles.guard";
import { Role } from "../orgs/enums/roles.enum";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { AuditResponseDto } from "./dtos/audit-response.dto";

@Controller("orgs/:orgId/audit-logs")
export class AuditController {
  // -----------------------------------------------------------------------------------------------
  constructor(private audit: AuditService) {}

  // -----------------------------------------------------------------------------------------------
  // GET /orgs/:orgId/audit-logs → List audit logs by org
  @Get()
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiResponse({ status: 200, type: [AuditResponseDto] })
  @ApiBearerAuth()
  async list(@Param("orgId") orgId: string) {
    return this.audit.listByOrg(orgId, 50);
  }

  // -----------------------------------------------------------------------------------------------
}
