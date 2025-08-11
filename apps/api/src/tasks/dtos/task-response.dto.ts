import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TaskStatus } from "../enums/task-status.enum";

export class TaskResponseDto {
  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  id: string;

  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  orgId: string;

  @ApiProperty({ example: "My Task" })
  title: string;

  @ApiPropertyOptional({ example: "My Task Description" })
  description?: string;

  @ApiPropertyOptional({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  assigneeId?: string;

  @ApiProperty({ example: "pending", enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
  createdAt: Date;
}
