import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DatabaseConfig } from "src/config/typeorm/database-config.factory";
import { BaseRepository } from "./typeorm/base-repository";
import { DbConnection } from "src/config/typeorm/dbConnection";
import { ClearDatabaseReporistory } from "./repositories/clear-database-repository";
import { ClearDatabaseService } from "./clear-database.service";
import { ClearDatabaseController } from "./clear-database.controller";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: DatabaseConfig,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        const connection = DbConnection.getInstance(); // Initialize DbConnection with DataSource
        connection.connect(dataSource);
        return dataSource;
      },
    }),
  ],
  providers: [BaseRepository, ClearDatabaseReporistory, ClearDatabaseService],
  controllers: [ClearDatabaseController],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const dbConnection = DbConnection.getInstance();
    await dbConnection.connect(this.dataSource);
  }
}
