import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { User } from "../auth/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // For simplicity, using `useFactory` to allow tests to override the DB path by setting the env var
      useFactory: () => {
        console.log("[AppModule] DB:", process.env.AUTH_DB_SQLITE_PATH);

        return {
          type: "sqlite",
          database: process.env.AUTH_DB_SQLITE_PATH ?? "./data/auth.sqlite",
          entities: [User],
          synchronize: true, // dev only
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
