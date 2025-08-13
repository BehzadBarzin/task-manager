import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuditService {
  // -----------------------------------------------------------------------------------------------
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  // -----------------------------------------------------------------------------------------------
  // Save an audit log
  async log(
    orgId: string,
    actorId: string,
    action: string,
    targetId?: string,
    meta?: any
  ) {
    const entry = this.repo.create({ orgId, actorId, action, targetId, meta });
    return this.repo.save(entry);
  }

  // -----------------------------------------------------------------------------------------------
  // List audit logs by organization
  async listByOrg(orgId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { orgId },
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -----------------------------------------------------------------------------------------------
}
