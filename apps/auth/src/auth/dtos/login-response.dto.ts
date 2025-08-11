import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNmEzMjgzZC02MjllLTRhNmQtOTA5MC05MTg1YmQ0ZDY1MDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJuYW1lIjpudWxsLCJpYXQiOjE3NTQ5MTUwMDcsImV4cCI6MTc1NDkxODYwN30.TyGnWwYSfL4W05EKG_mwcmjTf_GH_1Iwu-kpN-tTk3Q",
  })
  access_token: string;
}
