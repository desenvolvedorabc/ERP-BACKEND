import { DbConnection } from "src/config/typeorm/dbConnection";
import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectType,
  Repository,
} from "typeorm";

export class BaseRepository<T> extends Repository<T> {
  constructor(
    private readonly entityCls: EntityTarget<T>,
    protected readonly dataSource: DataSource,
    private readonly dbConnection = DbConnection.getInstance(),
  ) {
    const entityManager = dataSource
      ? dbConnection.getEntityManager(dataSource)
      : new EntityManager(dataSource);
    super(entityCls, entityManager);
  }

  getRepository<Entity>(entity: ObjectType<Entity>): Repository<Entity> {
    return this.dbConnection.getRepository(entity);
  }
}
