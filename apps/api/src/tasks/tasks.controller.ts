import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrgRolesGuard } from "../guards/org-roles.guard";
import { CurrentUser, Roles } from "@task-manager/shared-auth";
import { AuditService } from "../audit/audit.service";
import { Role } from "../orgs/enums/roles.enum";
import { CreateTaskDto } from "./dtos/create-task.dto";
import { ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UpdateTaskDto } from "./dtos/update-task.dto";
import { TaskResponseDto } from "./dtos/task-response.dto";
import { type RequestUser } from "@task-manager/data";

@Controller("tasks")
export class TasksController {
  // -----------------------------------------------------------------------------------------------
  constructor(private tasks: TasksService, private audit: AuditService) {}

  // -----------------------------------------------------------------------------------------------
  // POST /tasks -> create task
  @Post()
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  @ApiBearerAuth()
  async create(
    @CurrentUser() user: RequestUser,
    @Body()
    body: CreateTaskDto
  ): Promise<TaskResponseDto> {
    const created = await this.tasks.create({
      orgId: body.orgId,
      title: body.title,
      description: body.description,
      assigneeId: body.assigneeId,
    });

    await this.audit.log(body.orgId, user.id, "task:create", created.id, {
      title: created.title,
    });

    return created;
  }

  // -----------------------------------------------------------------------------------------------
  // GET /tasks?orgId=... -> list tasks
  @Get()
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  @ApiBearerAuth()
  async list(@Query("orgId") orgId: string): Promise<TaskResponseDto[]> {
    return this.tasks.listByOrg(orgId);
  }

  // -----------------------------------------------------------------------------------------------
  // PUT /tasks/:id -> update task
  @Put(":id")
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiBearerAuth()
  async update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: UpdateTaskDto
  ): Promise<TaskResponseDto> {
    const updated = await this.tasks.update(id, body);

    await this.audit.log(updated.orgId, user.id, "task:update", updated.id, {
      patch: body,
    });

    return updated;
  }

  // -----------------------------------------------------------------------------------------------
  // DELETE /tasks/:id
  @Delete(":id")
  @UseGuards(JwtAuthGuard, OrgRolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiBearerAuth()
  async remove(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Query("orgId") orgId: string // OrgRolesGuard needs an orgId in either body, query, or params to perform RBAC
  ): Promise<TaskResponseDto> {
    const removed = await this.tasks.remove(id);

    await this.audit.log(removed.orgId, user.id, "task:delete", removed.id);

    return removed;
  }

  // -----------------------------------------------------------------------------------------------
}
