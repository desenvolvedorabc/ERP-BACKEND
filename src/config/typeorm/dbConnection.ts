import {
  DataSource,
  EntityManager,
  ObjectType,
  QueryRunner,
  Repository,
} from "typeorm";

export class ConnectionNotFoundError extends Error {
  constructor() {
    super("No connection was found");
    this.name = "ConnectionNotFoundError";
  }
}

export class TransactionNotFoundError extends Error {
  constructor() {
    super("No transaction was found");
    this.name = "TransactionNotFoundError";
  }
}

interface DbTransaction {
  openTransaction: () => Promise<void>;
  closeTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export class DbConnection implements DbTransaction {
  private static instance?: DbConnection;
  private queryRunner?: QueryRunner;
  private dataSource?: DataSource;

  private constructor() {}

  static getInstance(): DbConnection {
    if (DbConnection.instance === undefined)
      DbConnection.instance = new DbConnection();
    return DbConnection.instance;
  }

  async connect(dataSource: DataSource): Promise<void> {
    this.dataSource = dataSource;
  }

  async disconnect(): Promise<void> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError();
    await this.dataSource.destroy();
    this.queryRunner = undefined;
    this.dataSource = undefined;
  }

  async openTransaction(): Promise<void> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError();
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async closeTransaction(): Promise<void> {
    if (this.queryRunner === undefined) throw new TransactionNotFoundError();
    await this.queryRunner.release();
    this.queryRunner = undefined; // fix error in getRepository: Query runner already released. Cannot run queries anymore.
  }

  async commit(): Promise<void> {
    if (this.queryRunner === undefined) throw new TransactionNotFoundError();
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    if (this.queryRunner === undefined) throw new TransactionNotFoundError();
    await this.queryRunner.rollbackTransaction();
  }

  getRepository<Entity>(entity: ObjectType<Entity>): Repository<Entity> {
    if (this.dataSource === undefined) throw new ConnectionNotFoundError();
    if (this.queryRunner !== undefined)
      return this.queryRunner.manager.getRepository(entity);
    return this.dataSource.getRepository(entity);
  }

  getEntityManager(ds: DataSource): EntityManager {
    if (this.queryRunner !== undefined) return this.queryRunner.manager;
    if (this.dataSource === undefined) this.dataSource = ds;
    return this.dataSource.createEntityManager();
  }
}
