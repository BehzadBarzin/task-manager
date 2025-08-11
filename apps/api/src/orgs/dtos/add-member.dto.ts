import { IsEnum, IsString } from "class-validator";
import { Role } from "../enums/roles.enum";
import { ApiProperty } from "@nestjs/swagger";

export class AddMemberDto {
  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: "viewer",
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}
