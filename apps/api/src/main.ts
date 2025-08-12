import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:4200"];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Task Manager API")
    .setDescription("Tasks, Orgs, RBAC, Audit logs")
    .setVersion("1.0")
    .addBearerAuth()
    .setExternalDoc("JSON Collection", "/docs/json")
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, doc, {
    jsonDocumentUrl: "/docs/json",
  });

  const port = process.env.API_SRV_PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 API service is running on: http://localhost:${port}/`);
}
bootstrap();
