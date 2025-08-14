import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppModule } from "./app/app.module";
import * as jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { Organization } from "./orgs/entities/org.entity";
import { Membership } from "./orgs/entities/membership.entity";
import { Task } from "./tasks/entities/task.entity";
import { v4 as uuid } from "uuid";
import { Role } from "./orgs/enums/roles.enum";

// -------------------------------------------------------------------------------------------------
interface User {
  id: string;
  email: string;
  displayName: string;
}

function getTestUser(): User {
  const id = uuid();
  return {
    id,
    email: `user-${id.split("-")[0]}@example.com`,
    displayName: `John Doe ${id.split("-")[0]}`,
  };
}

// -------------------------------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET!; // Must be the same secret used in the app to verify tokens
function signToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// -------------------------------------------------------------------------------------------------
describe("Auth Controller", () => {
  let app: INestApplication;
  let orgRepo: Repository<Organization>;
  let membershipRepo: Repository<Membership>;
  let taskRepo: Repository<Task>;

  beforeAll(async () => {
    // Because we used `forRootAsync` and `useFactory`, we can simply set the env var to change the DB path
    process.env.API_DB_SQLITE_PATH = ":memory:";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repositories
    orgRepo = moduleFixture.get<Repository<Organization>>(
      getRepositoryToken(Organization)
    );
    membershipRepo = moduleFixture.get<Repository<Membership>>(
      getRepositoryToken(Membership)
    );
    taskRepo = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await membershipRepo.clear();
    await orgRepo.clear(); // Clear orgs after memberships (FK constraint)
    await taskRepo.clear();
  });

  it("Authenticated users can create orgs and become owners", async () => {
    const owner = getTestUser();
    const ownerToken = signToken(owner);

    const res = await request(app.getHttpServer())
      .post("/orgs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "My Org" })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("My Org");

    // membership should exist (owner)
    const memberships = await membershipRepo.find({
      where: { orgId: res.body.id },
    });
    expect(memberships.length).toBe(1);
    expect(memberships[0].role).toBe(Role.OWNER);
    expect(memberships[0].userId).toBe(owner.id);
  });

  it("Owner can add members", async () => {
    const owner = getTestUser();
    const ownerToken = signToken(owner);

    const member = getTestUser();

    // Create org (via API) to add user as owner
    const orgRes = await request(app.getHttpServer())
      .post("/orgs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "My Org" })
      .expect(201);

    const orgId = orgRes.body.id;

    // Add user as member
    const res = await request(app.getHttpServer())
      .post(`/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: member.id, role: Role.VIEWER })
      .expect(201);

    expect(res.body).toHaveProperty("id");

    // membership should exist
    const memberships = await membershipRepo.find({
      where: { orgId },
    });
    expect(memberships.length).toBe(2);
    expect(memberships[1].role).toBe(Role.VIEWER);
    expect(memberships[1].userId).toBe(member.id);
  });

  it("Viewers cannot create tasks", async () => {
    const owner = getTestUser();
    const ownerToken = signToken(owner);

    const member = getTestUser();
    const memberToken = signToken(member);

    // Create org (via API) to add user as owner
    const orgRes = await request(app.getHttpServer())
      .post("/orgs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "My Org" })
      .expect(201);

    const orgId = orgRes.body.id;

    // Add user as member
    await request(app.getHttpServer())
      .post(`/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: member.id, role: Role.VIEWER })
      .expect(201);

    // Add task as viewer
    await request(app.getHttpServer())
      .post(`/orgs/${orgId}/tasks`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ title: "My Task" })
      .expect(403);
  });
});
