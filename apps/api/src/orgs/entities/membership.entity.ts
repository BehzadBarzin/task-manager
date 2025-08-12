import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Role } from "../enums/roles.enum";
import { Organization } from "./org.entity";

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

  // Relations
  @ManyToOne(() => Organization, { eager: false, nullable: false })
  @JoinColumn({ name: "orgId" })
  organization: Organization;
}
