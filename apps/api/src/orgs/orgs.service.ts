import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./entities/org.entity";
import { Repository } from "typeorm";
import { Membership } from "./entities/membership.entity";
import { Role } from "./enums/roles.enum";

@Injectable()
export class OrgsService {
  // -----------------------------------------------------------------------------------------------
  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(Membership) private membershipRepo: Repository<Membership>
  ) {}

  // -----------------------------------------------------------------------------------------------
  // Create an organization (current user as owner)
  async createOrg(name: string, ownerUserId: string) {
    const org = this.orgRepo.create({ name });
    const saved = await this.orgRepo.save(org);

    // create membership as owner
    const membership = this.membershipRepo.create({
      orgId: saved.id,
      userId: ownerUserId,
      role: Role.OWNER,
    });
    await this.membershipRepo.save(membership);

    return { org: saved, ownerMembership: membership };
  }

  // -----------------------------------------------------------------------------------------------
  // Get single organization by id
  async getOrg(orgId: string) {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException("Organization not found");
    }

    return org;
  }

  // -----------------------------------------------------------------------------------------------
  // Get a list of all organizations for a user
  async listOrgs(userId: string) {
    const memberships = await this.membershipRepo.find({
      where: { userId },
      relations: ["organization"],
    });

    return memberships.map((m) => m.organization);
  }
  // -----------------------------------------------------------------------------------------------
  // Add a member to an organization
  async addMember(orgId: string, userId: string, role: Role) {
    const existing = await this.membershipRepo.findOne({
      where: { orgId, userId },
    });
    if (existing) {
      existing.role = role;
      return this.membershipRepo.save(existing);
    }
    const m = this.membershipRepo.create({ orgId, userId, role });
    return this.membershipRepo.save(m);
  }

  // -----------------------------------------------------------------------------------------------
  // Remove a member from an organization
  async removeMember(orgId: string, userId: string) {
    const found = await this.membershipRepo.findOne({
      where: { orgId, userId },
    });
    if (!found) return null;
    await this.membershipRepo.remove(found);
    return found;
  }

  // -----------------------------------------------------------------------------------------------
  // List members of an organization
  async listMembers(orgId: string) {
    return this.membershipRepo.find({ where: { orgId } });
  }

  // -----------------------------------------------------------------------------------------------
}
