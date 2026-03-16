import { Injectable } from "@nestjs/common";
import { DataSource, In, LessThan, Not, SelectQueryBuilder } from "typeorm";
import { CreateInstallmentDTO } from "../dto/createInstallment.dto";
import { UpdateInstallmentDTO } from "../dto/updateInstallment.dto";
import { Installments } from "../entities/installments.entity";
import { InstallmentStatus } from "../enum";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { InstallmentsParamsDTO } from "../dto/installmentsParams.dto";
import { DueBetween } from "src/modules/receivables/dto/receivablePaginateParams.dto";
import { ListInstallmentsResponse } from "../dto/listInstallmentsResponse.dto";

@Injectable()
export class InstallmentsRepository extends BaseRepository<Installments> {
  constructor(dataSource: DataSource) {
    super(Installments, dataSource);
  }

  async _create(data: Array<CreateInstallmentDTO>): Promise<Installments[]> {
    const repo = this.getRepository(Installments);
    const newInstallment = await repo.create(data);
    return await repo.save(newInstallment);
  }

  async _findById(id: number): Promise<Installments> {
    return await this.getRepository(Installments).findOne({ where: { id } });
  }

  async _update(id: number, data: UpdateInstallmentDTO): Promise<void> {
    await this.getRepository(Installments).save({ id, ...data });
  }

  async _updateManyInstallmentsDate(
    data: Partial<CreateInstallmentDTO>[],
  ): Promise<void> {
    await this.getRepository(Installments).save(data);
  }

  async _markAsPaid(id: number): Promise<void> {
    await this.getRepository(Installments)
      .createQueryBuilder()
      .update(Installments)
      .set({ status: InstallmentStatus.PAID })
      .where("id = :id", { id })
      .execute();
  }

  async _markAsPending(id: number): Promise<void> {
    await this.getRepository(Installments)
      .createQueryBuilder()
      .update(Installments)
      .set({ status: InstallmentStatus.PENDING })
      .where("id = :id", { id })
      .execute();
  }

  async _cancelPayableInstallments(id: number): Promise<void> {
    await this.getRepository(Installments).update(
      { payableId: id, status: InstallmentStatus.PENDING },
      { status: InstallmentStatus.CANCELLED },
    );
  }

  async _hasPendingInstallments(
    payableId: number | null,
    receivableId: number | null,
    installmentId: number,
  ): Promise<boolean> {
    return await this.getRepository(Installments).exists({
      where: {
        receivableId,
        payableId,
        status: InstallmentStatus.PENDING,
        id: Not(installmentId),
      },
    });
  }

  async _cancelReceivableInstallments(id: number): Promise<void> {
    await this.getRepository(Installments).update(
      { receivableId: id, status: InstallmentStatus.PENDING },
      { status: InstallmentStatus.CANCELLED },
    );
  }

  async _findResidualValuePayable(
    id: number,
  ): Promise<{ total: number | null }> {
    const a = await this.getRepository(Installments)
      .createQueryBuilder("Installment")
      .where("Installment.payableId = :q AND Installment.status = :s", {
        q: id,
        s: InstallmentStatus.CANCELLED,
      })
      .select("SUM(Installment.value)", "total")
      .getRawOne();

    return a;
  }

  async _findResidualValueReceivable(
    id: number,
  ): Promise<{ total: number | null }> {
    return await this.getRepository(Installments)
      .createQueryBuilder("Installment")
      .where("Installment.receivableId = :q AND Installment.status = :s", {
        q: id,
        s: InstallmentStatus.CANCELLED,
      })
      .select("SUM(Installment.value)", "total")
      .getRawOne();
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Installments).delete({ id });
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(Installments).exist({ where: { id } });
  }

  async _receivableHasInstallments(receivableId: number): Promise<boolean> {
    return await this.getRepository(Installments).exist({
      where: { receivableId },
    });
  }

  async _findByReceivableId(
    id: number,
  ): Promise<Pick<Installments, "id" | "dueDate" | "status" | "value">[]> {
    return await this.getRepository(Installments).find({
      where: { payableId: id },
      select: { id: true, dueDate: true, status: true, value: true },
    });
  }

  async _findByPayableId(
    id: number,
  ): Promise<Pick<Installments, "id" | "dueDate" | "status" | "value">[]> {
    return await this.getRepository(Installments).find({
      where: { receivableId: id },
      select: { id: true, dueDate: true, status: true, value: true },
    });
  }

  async _findAll(
    params: InstallmentsParamsDTO,
  ): Promise<Pagination<ListInstallmentsResponse, IPaginationMeta>> {
    const queryBuilder = this._buildInstallmentsQuery(params);

    const data = await this._buildPaginatedData(params, queryBuilder);

    return data;
  }

  async _handleOverdueInstallments() {
    const result = await this.getRepository(Installments).update(
      {
        dueDate: LessThan(new Date()),
        status: InstallmentStatus.PENDING,
      },
      {
        status: InstallmentStatus.OVERDUE,
      },
    );

    const ids: Pick<Installments, "payableId" | "receivableId">[] =
      await this.getRepository(Installments).find({
        where: { id: In(result.raw) },
        select: {
          payableId: true,
          receivableId: true,
        },
      });

    return { ids, result };
  }

  private _buildInstallmentsQuery({
    CNPJorNameSearch,
    identificationCodeSearch,
    accountId,
    dueBetween,
    typeOfTransaction,
    orderDueDate,
    orderValue,
  }: InstallmentsParamsDTO): SelectQueryBuilder<Installments> {
    const isReceivable = typeOfTransaction === "Receivable";

    const queryBuilder =
      this.getRepository(Installments).createQueryBuilder("Installment");

    this._applyJoins(queryBuilder);
    this._applySelect(queryBuilder, isReceivable);
    this._applyTransationTypeFilter(queryBuilder, isReceivable);
    this._applyAccountFilter(queryBuilder, accountId, isReceivable);
    this._applyDueDateFilter(queryBuilder, dueBetween);
    this._applyNameOrCNPJFilter(queryBuilder, CNPJorNameSearch, isReceivable);
    this._applyIdentifierCodeFilter(
      queryBuilder,
      identificationCodeSearch,
      isReceivable,
    );
    this._applyOrdenation(queryBuilder, orderValue, orderDueDate);

    return queryBuilder;
  }

  private _applyJoins(queryBuilder: SelectQueryBuilder<Installments>) {
    queryBuilder
      .leftJoin("Installment.receivable", "Receivable")
      .leftJoin("Installment.payable", "Payable")
      .leftJoin("Payable.supplier", "Supplier")
      .leftJoin("Payable.collaborator", "Collaborator")
      .leftJoin("Payable.account", "PayableAccount")
      .leftJoin("Receivable.account", "ReceivableAccount")
      .leftJoin("Receivable.financier", "Financier")
      .where(
        "(Installment.status = :status OR Installment.status = :status2)",
        {
          status: InstallmentStatus.PENDING,
          status2: InstallmentStatus.OVERDUE,
        },
      );
  }

  private _applySelect(
    queryBuilder: SelectQueryBuilder<Installments>,
    isReceivable: boolean,
  ) {
    if (isReceivable) {
      queryBuilder.select([
        "Installment.id AS id",
        "ReceivableAccount.bank AS bank",
        "Receivable.identifierCode AS identification",
        "CAST(CONCAT('Parcela ', Installment.installmentNumber, '/', Installment.totalInstallments) AS CHAR) AS aditionalDescription",
        "Financier.cnpj AS cnpj",
        "Installment.dueDate AS dueDate",
        "Installment.value as value",
      ]);
    } else {
      queryBuilder.select([
        "Installment.id AS id",
        "PayableAccount.bank AS bank",
        "Payable.identifierCode AS identification",
        "CAST(CONCAT('Parcela ', Installment.installmentNumber, '/', Installment.totalInstallments) AS CHAR) AS aditionalDescription",
        "CASE WHEN Payable.supplierId IS NULL THEN Collaborator.cpf ELSE Supplier.cnpj END AS cnpj",
        "Installment.dueDate AS dueDate",
        "(Installment.value * -1) as value",
      ]);
    }
  }

  private _applyTransationTypeFilter(
    queryBuilder: SelectQueryBuilder<Installments>,
    isReceivable: boolean,
  ) {
    if (isReceivable) {
      queryBuilder.andWhere("Installment.receivableId IS NOT NULL");
    } else {
      queryBuilder.andWhere("Installment.payableId IS NOT NULL");
    }
  }

  private _applyAccountFilter(
    queryBuilder: SelectQueryBuilder<Installments>,
    accountId: number,
    isReceivable: boolean,
  ) {
    if (isReceivable) {
      queryBuilder.andWhere("Receivable.accountId = :accountId", { accountId });
    } else {
      queryBuilder.andWhere("Payable.accountId = :accountId", { accountId });
    }
  }

  private _applyDueDateFilter(
    queryBuilder: SelectQueryBuilder<Installments>,
    dueBetween: DueBetween,
  ) {
    if (dueBetween && dueBetween.start && dueBetween.end) {
      queryBuilder.andWhere("Installment.dueDate BETWEEN :start AND :end", {
        start: dueBetween.start,
        end: dueBetween.end,
      });
    }
  }

  private _applyNameOrCNPJFilter(
    queryBuilder: SelectQueryBuilder<Installments>,
    CNPJorNameSearch: string,
    isReceivable: boolean,
  ) {
    if (CNPJorNameSearch) {
      const searchCondition = isReceivable
        ? `(Financier.name LIKE :search OR Financier.cnpj LIKE :search)`
        : `(Supplier.name LIKE :search OR Supplier.cnpj LIKE :search OR Collaborator.name LIKE :search OR Collaborator.cpf LIKE :search)`;

      queryBuilder.andWhere(searchCondition, {
        search: `%${CNPJorNameSearch}%`,
      });
    }
  }

  private _applyIdentifierCodeFilter(
    queryBuilder: SelectQueryBuilder<Installments>,
    identificationCodeSearch: string,
    isReceivable: boolean,
  ) {
    if (identificationCodeSearch) {
      const idCodeCondition = isReceivable
        ? "Receivable.identifierCode LIKE :q"
        : "Payable.identifierCode LIKE :q";
      queryBuilder.andWhere(idCodeCondition, {
        q: `%${identificationCodeSearch}%`,
      });
    }
  }

  private _applyOrdenation(
    queryBuilder: SelectQueryBuilder<Installments>,
    orderValue: "ASC" | "DESC",
    orderDueDate: "ASC" | "DESC",
  ) {
    queryBuilder.orderBy("Installment.value", orderValue);
    queryBuilder.addOrderBy("Installment.dueDate", orderDueDate);
  }

  private async _buildPaginatedData(
    { limit, page }: InstallmentsParamsDTO,
    queryBuilder: SelectQueryBuilder<Installments>,
  ) {
    queryBuilder.offset((page - 1) * limit).limit(limit);

    const totalItems = await queryBuilder.getCount();

    const items = await queryBuilder.getRawMany<ListInstallmentsResponse>();
    const data: Pagination<ListInstallmentsResponse, IPaginationMeta> = {
      meta: {
        currentPage: page,
        limit,
        totalCount: totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
      },
      items,
    };

    return data;
  }
}
