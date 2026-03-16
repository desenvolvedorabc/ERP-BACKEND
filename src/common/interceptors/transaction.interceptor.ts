import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, concatMap, finalize } from "rxjs";
import { DbConnection } from "src/config/typeorm/dbConnection";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly dbConnection = DbConnection.getInstance();

  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      console.log("Transação aberta");
    } catch (error) {
      console.error("Failed to open transaction:", error);
      throw new Error("Unable to start transaction");
    }

    return next.handle().pipe(
      concatMap(async (data) => {
        await queryRunner.commitTransaction();
        return data;
      }),
      catchError(async (error) => {
        await queryRunner.rollbackTransaction();
        console.error("Erro ao realizar transação", error);
        throw error;
      }),
      finalize(async () => {
        try {
          await queryRunner.release();
          console.log("Transação fechada");
        } catch (error) {
          console.error("Erro ao liberar a transação:", error);
        }
      }),
    );
  }
}
