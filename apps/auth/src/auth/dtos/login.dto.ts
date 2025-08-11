import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    name: "email",
    example: "john@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    name: "password",
    example: "Abcd1234.",
  })
  @IsString()
  @MinLength(8)
  password: string;
}
