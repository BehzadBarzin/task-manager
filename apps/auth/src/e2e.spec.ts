import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./app/app.module";

describe("Auth Controller", () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Because we used `forRootAsync` and `useFactory`, we can simply set the env var to change the DB path
    process.env.AUTH_DB_SQLITE_PATH = ":memory:";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("[POST] /auth/register", () => {
    it("Should create user", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "john@example.com",
          password: "Abcd1234.",
          displayName: "John Doe",
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe("john@example.com");
    });

    it("Should throw error if email already exists", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "john@example.com",
          password: "Abcd1234.",
          displayName: "John Doe",
        })
        .expect(400);
    });

    it("Should throw error if password is weak", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "john@example.com",
          password: "12345678",
          displayName: "John Doe",
        })
        .expect(400);
    });
  });

  describe("[POST] /auth/login", () => {
    it("Should return JWT", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "john@example.com", password: "Abcd1234." })
        .expect(201);

      expect(res.body).toHaveProperty("access_token");
      expect(typeof res.body.access_token).toBe("string");
    });

    it("Should throw error if invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "john@example.com", password: "Abcd123." })
        .expect(400);
    });
  });
});
