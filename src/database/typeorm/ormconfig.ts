import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || process.env.DB_HOST_LOCAL,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME || process.env.DB_USERNAME_LOCAL,
  password: process.env.DB_PASSWORD || process.env.DB_PASSWORD_LOCAL,
  database: process.env.DB_NAME,
  entities: ["src/**/*.entity{.ts,.js}"],
  migrations: ["src/database/migrations/**/*{.ts,.js}"],
  synchronize: false,
  migrationsRun: true,
  logging: process.env.DB_LOGGING !== "false",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    connectionLimit: 20,
  },
});
