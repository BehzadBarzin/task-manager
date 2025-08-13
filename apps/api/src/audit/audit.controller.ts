import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "@task-manager/shared-auth";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrgRolesGuard } from "../guards/org-roles.guard";
import { Role } from "../orgs/enums/roles.enum";
import { ApiBearerAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AuditResponseDto } from "./dtos/audit-response.dto";
import { PaginatedAuditResponseDto } from "./dtos/paginated-audit-response.dto";

@Controller("orgs/:orgId/audit-logs")
export class AuditController {
  // -----------------------------------------------------------------------------------------------
  constructor(private audit: AuditService) {}

  // -----------------------------------------------------------------------------------------------
  // GET /orgs/:orgId/audit-logs → List audit logs by org
  @Get()
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiResponse({ status: 200, type: PaginatedAuditResponseDto })
  @ApiBearerAuth()
  async list(
    @Param("orgId") orgId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<PaginatedAuditResponseDto> {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10)); // cap at 100

    return this.audit.listByOrg(orgId, pageNumber, limitNumber);
  }

  // -----------------------------------------------------------------------------------------------
}
