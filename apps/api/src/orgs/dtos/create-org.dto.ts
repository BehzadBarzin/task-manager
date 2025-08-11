import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateOrgDto {
  @ApiProperty({ example: "My Org" })
  @IsString()
  name: string;
}
