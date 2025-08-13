import { ApiProperty } from "@nestjs/swagger";

export class SearchUsersDto {
  @ApiProperty({
    example: "john",
  })
  searchTerm: string;
}
