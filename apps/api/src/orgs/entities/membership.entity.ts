import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { Role } from "../enums/roles.enum";

@Entity("memberships")
export class Membership {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orgId: string;

  @Column()
  userId: string;

  @Column({
    type: "simple-enum",
    enum: Role,
    default: Role.VIEWER,
  })
  role: Role;

  @CreateDateColumn()
  addedAt: Date;
}
