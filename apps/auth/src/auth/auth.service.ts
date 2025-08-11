import { Injectable, ConflictException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "./entities/user.entity";

/**
 * AuthService: responsible for register/login and JWT creation.
 * The API app will not call DB here — it will call auth service for login,
 * and will verify tokens locally using the same JWT_SECRET.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService
  ) {}

  /**
   * Register a new user. Throws if email exists.
   */
  async register(email: string, password: string, displayName?: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({ email, passwordHash, displayName });

    return this.usersRepo.save(user);
  }

  /**
   * Validate credentials and return a minimal public user object
   * (no password hash).
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    const { passwordHash, ...rest } = user as any;

    return rest as { id: string; email: string; displayName?: string };
  }

  /**
   * Create a JWT for a validated user.
   */
  async login(user: { id: string; email: string; displayName?: string }) {
    const payload = { sub: user.id, email: user.email, name: user.displayName };
    return { access_token: this.jwt.sign(payload) };
  }

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }
}
