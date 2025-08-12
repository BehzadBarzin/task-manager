import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Delete,
} from "@nestjs/common";
import { OrgsService } from "./orgs.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "@task-manager/shared-auth";
import { OrgRolesGuard } from "../guards/org-roles.guard";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "@task-manager/shared-auth";
import { CreateOrgDto } from "./dtos/create-org.dto";
import { ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";
import { Role } from "./enums/roles.enum";
import { AddMemberDto } from "./dtos/add-member.dto";
import { CreateOrgResponseDto } from "./dtos/create-org-response.dto";
import { MembershipResponseDto } from "./dtos/membership-response.dto";
import { type RequestUser } from "@task-manager/data";

@Controller("orgs")
export class OrgsController {
  // -----------------------------------------------------------------------------------------------
  constructor(private orgs: OrgsService, private audit: AuditService) {}

  // -----------------------------------------------------------------------------------------------
  // POST /orgs -> create organization
  @Post()
  @UseGuards(JwtAuthGuard) // Only apply authentication (not authorization)
  @ApiBody({ type: CreateOrgDto })
  @ApiResponse({ status: 201, type: CreateOrgResponseDto })
  @ApiBearerAuth()
  async createOrg(
    @CurrentUser() user: RequestUser, // Retrieve the user from the request (attached by `JwtAuthGuard`)
    @Body() body: CreateOrgDto
  ): Promise<CreateOrgResponseDto> {
    const { org } = await this.orgs.createOrg(body.name, user.id);

    // audit: org created
    await this.audit.log(org.id, user.id, "org:create", org.id, {
      name: org.name,
    });

    return org;
  }

  // -----------------------------------------------------------------------------------------------
  // GET /orgs → get all organizations for the current user
  @Get()
  @UseGuards(JwtAuthGuard) // Only apply authentication (not authorization)
  @ApiResponse({ status: 200, type: [CreateOrgResponseDto] })
  @ApiBearerAuth()
  async getOrgs(
    @CurrentUser() user: RequestUser
  ): Promise<CreateOrgResponseDto[]> {
    const orgs = await this.orgs.listOrgs(user.id);

    return orgs;
  }

  // -----------------------------------------------------------------------------------------------
  // POST /orgs/:orgId/members -> add member to organization
  @Post(":orgId/members")
  @UseGuards(JwtAuthGuard, OrgRolesGuard) // Apply authentication (JwtAuthGuard) & authorization (OrgRolesGuard)
  @Roles(Role.OWNER) // Only owners (or higher roles) can add members (Required roles: OWNER)
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: 201, type: MembershipResponseDto })
  @ApiBearerAuth()
  async addMember(
    @CurrentUser() user: RequestUser,
    @Param("orgId") orgId: string,
    @Body() body: AddMemberDto
  ): Promise<MembershipResponseDto> {
    const added = await this.orgs.addMember(orgId, body.userId, body.role);

    await this.audit.log(orgId, user.id, "member:add", added.id, {
      userId: body.userId,
      role: body.role,
    });

    return added;
  }

  // -----------------------------------------------------------------------------------------------
  // DELETE /orgs/:orgId/members/:userId -> remove member from organization
  @Delete(":orgId/members/:userId")
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.OWNER)
  @ApiResponse({ status: 200, type: MembershipResponseDto })
  @ApiBearerAuth()
  async removeMember(
    @CurrentUser() user: RequestUser,
    @Param("orgId") orgId: string,
    @Param("userId") userId: string
  ): Promise<MembershipResponseDto | null> {
    const removed = await this.orgs.removeMember(orgId, userId);

    await this.audit.log(orgId, user.id, "member:remove", removed?.id, {
      removedUserId: userId,
    });

    return removed;
  }

  // -----------------------------------------------------------------------------------------------
  // GET /orgs/:orgId/members -> list members of organization
  @Get(":orgId/members")
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER) // any member can list members
  @ApiResponse({ status: 200, type: [MembershipResponseDto] })
  @ApiBearerAuth()
  async listMembers(
    @Param("orgId") orgId: string
  ): Promise<MembershipResponseDto[]> {
    return this.orgs.listMembers(orgId);
  }

  // -----------------------------------------------------------------------------------------------
}
