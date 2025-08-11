import { Body, Controller, Post, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags, ApiBody, ApiResponse } from "@nestjs/swagger";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { LoginResponseDto } from "./dtos/login-response.dto";
import { RegisterResponseDto } from "./dtos/register-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  // -----------------------------------------------------------------------------------------------
  constructor(private auth: AuthService) {}

  // -----------------------------------------------------------------------------------------------
  // POST /auth/register
  @Post("register")
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "Register a new user",
    type: RegisterResponseDto,
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      const user = await this.auth.register(
        dto.email,
        dto.password,
        dto.displayName
      );

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      };
    } catch (e) {
      // transform to bad request so client gets readable message
      throw new BadRequestException((e as Error).message);
    }
  }

  // -----------------------------------------------------------------------------------------------
  // POST /auth/login
  @Post("login")
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: "Login (returns JWT)",
    type: LoginResponseDto,
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.auth.validateUser(dto.email, dto.password);

    if (!user) throw new BadRequestException("Invalid credentials");

    return this.auth.login(user);
  }

  // -----------------------------------------------------------------------------------------------
}
