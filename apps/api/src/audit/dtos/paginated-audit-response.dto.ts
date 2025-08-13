import { ApiProperty } from "@nestjs/swagger";
import { AuditResponseDto } from "./audit-response.dto";

class PaginationMetaDto {
  @ApiProperty({
    description: "Total number of items",
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  totalPages: number;
}

export class PaginatedAuditResponseDto {
  @ApiProperty({
    type: [AuditResponseDto],
  })
  data: AuditResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
