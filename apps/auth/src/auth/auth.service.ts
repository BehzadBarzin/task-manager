import { Injectable, ConflictException } from "@nestjs/common";
import { Like, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "./entities/user.entity";
import { type JWTPayload } from "@task-manager/data";

@Injectable()
export class AuthService {
  // -----------------------------------------------------------------------------------------------
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService
  ) {}

  // -----------------------------------------------------------------------------------------------
  // Register a new user. Throws if email exists.
  async register(email: string, password: string, displayName?: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({ email, passwordHash, displayName });

    return this.usersRepo.save(user);
  }

  // -----------------------------------------------------------------------------------------------
  // Validate credentials and return a minimal public user object (without password hash).
  async validateUser(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    const { passwordHash, ...rest } = user as any;

    return rest as { id: string; email: string; displayName?: string };
  }

  // -----------------------------------------------------------------------------------------------
  // Create a JWT for a validated user.
  async login(user: { id: string; email: string; displayName?: string }) {
    const payload: Partial<JWTPayload> = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    return { access_token: this.jwt.sign(payload) };
  }

  // -----------------------------------------------------------------------------------------------
  // Find user by id
  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // -----------------------------------------------------------------------------------------------
  async searchUsers(searchTerm: string) {
    const users = await this.usersRepo.find({
      where: [
        { email: Like(`%${searchTerm}%`) },
        { displayName: Like(`%${searchTerm}%`) },
      ],
      take: 10,
    });

    return users.map((user) => {
      const { passwordHash, ...rest } = user;
      return rest;
    });
  }

  // -----------------------------------------------------------------------------------------------
}
