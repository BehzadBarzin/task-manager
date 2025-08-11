import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsStrongPassword } from "class-validator";

export class RegisterDto {
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
  @IsStrongPassword({ minLength: 8 })
  password: string;

  @ApiProperty({
    name: "displayName",
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  displayName?: string;
}
