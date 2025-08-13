import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuditResponseDto {
  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  id: string;

  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  orgId: string;

  @ApiProperty({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  actorId: string;

  @ApiProperty({
    example: "task:update",
  })
  action: string;

  @ApiPropertyOptional({
    example: "edb02073-7032-4674-871c-b4f356447cdf",
  })
  targetId?: string;

  @ApiPropertyOptional({
    example: '{"patch":{"status":"in_progress"}}',
  })
  meta?: any;

  @ApiProperty({
    example: "2022-01-01T00:00:00.000Z",
  })
  createdAt: Date;
}
