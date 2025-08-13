import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../enums/task-status.enum";

export class UpdateTaskDto {
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
