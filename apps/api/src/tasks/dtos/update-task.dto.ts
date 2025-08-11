import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateTaskDto {
  @ApiProperty({ example: "My Task" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: "My Task Description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  @IsString()
  @IsOptional()
  assigneeId?: string;
}
