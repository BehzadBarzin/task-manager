import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Auth Service")
    .setDescription("Authentication microservice (JWT)")
    .setVersion("1.0")
    .setExternalDoc("JSON Collection", "/docs/json")
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, doc, {
    jsonDocumentUrl: "/docs/json",
  });

  const port = process.env.AUTH_SRV_PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 Auth service is running on: http://localhost:${port}/`);
}
bootstrap();
