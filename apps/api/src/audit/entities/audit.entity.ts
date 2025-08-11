import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orgId: string;

  @Column()
  actorId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetId?: string;

  @Column({ type: "json", nullable: true })
  meta?: any;

  @CreateDateColumn()
  createdAt: Date;
}
