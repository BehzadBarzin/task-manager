import { ApiProperty } from "@nestjs/swagger";

export class CreateOrgResponseDto {
  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  id: string;

  @ApiProperty({
    example: "My Org",
  })
  name: string;

  @ApiProperty({
    example: "2022-01-01T00:00:00.000Z",
  })
  createdAt: Date;
}
