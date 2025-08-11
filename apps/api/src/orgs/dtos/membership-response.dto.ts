import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../enums/roles.enum";

export class MembershipResponseDto {
  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  id: string;

  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  orgId: string;

  @ApiProperty({ example: "edb02073-7032-4674-871c-b4f356447cdf" })
  userId: string;

  @ApiProperty({ example: "viewer", enum: Role })
  role: Role;

  @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
  addedAt: Date;
}
