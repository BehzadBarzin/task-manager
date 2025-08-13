import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  id: string;

  @ApiProperty({
    example: "john@example.com",
  })
  email: string;

  @ApiProperty({
    example: "John Doe",
  })
  displayName?: string;

  @ApiProperty({
    example: "2022-01-01T00:00:00.000Z",
  })
  createdAt: Date;
}
