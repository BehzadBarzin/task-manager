import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  @IsString()
  orgId: string;

  @ApiProperty({ example: "My Task" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "My Task Description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  @IsString()
  @IsOptional()
  assigneeId?: string;
}
