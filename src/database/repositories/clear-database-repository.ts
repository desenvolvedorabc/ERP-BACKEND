import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager, ObjectType } from "typeorm";

@Injectable()
export class ClearDatabaseReporistory {
  constructor(protected readonly dataSource: DataSource) {}

  async _clear<T>(
    manager: EntityManager,
    Entity: ObjectType<T>,
  ): Promise<void> {
    await manager.getRepository(Entity).clear();
    console.log(Entity.name, "sucessfully deleted.");
  }

  async _deleteAll<T>(
    manager: EntityManager,
    Entity: ObjectType<T>,
  ): Promise<void> {
    await manager.getRepository(Entity).delete({});
    console.log(Entity.name, "sucessfully deleted.");
  }
}
