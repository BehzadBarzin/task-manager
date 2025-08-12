import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../enums/task-status.enum";

export class UpdateTaskDto {
  // `OrgRolesGuard` requires on orgId in the request (body, query, params) to perform RBAC
  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  @IsString()
  orgId: string;

  @ApiPropertyOptional({ example: "My Task" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: "My Task Description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: "completed", enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
