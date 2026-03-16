import { Tables } from "src/modules/files/enums";
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from "@nestjs/common";
import { addMonths, isBefore, isEqual, set } from "date-fns";
import { Payables } from "../payables/entities/payable.entity";
import { RecurrenceType } from "../payables/enums";
import { Receivables } from "../receivables/entities/receivables.entity";
import { CreateInstallmentDTO } from "./dto/createInstallment.dto";
import { InstallmentStatus, InstallmentType } from "./enum";
import {
  CancelError,
  CreatingInstallmentsError,
  FetchingInstallmentsError,
  GeneratingInstallmentsError,
  MarkAsPaidError,
  UpdateManyInstallmentsDate,
} from "./errors/InstallmentsErrors";
import { InstallmentsRepository } from "./repositories/installments-repository";
import { InstallmentsParamsDTO } from "./dto/installmentsParams.dto";
import { Installments } from "./entities/installments.entity";
import { UpdateInstallmentDTO } from "./dto/updateInstallment.dto";

type MultipleInstallmentsProps = {
  installmentNumber?: number;
  startDate: Date;
  endDate: Date;
  dueDay: number;
  liquidValue: number;
  table: Tables;
  id: number;
  recurrenceType: RecurrenceType;
  taxValue?: number;
};

type SingleInstallmentProps = {
  liquidValue: number;
  table: Tables;
  dueDate: Date;
  id: number;
  taxValue?: number;
};

@Injectable()
export class InstallmentsService {
  constructor(private installmentsRepository: InstallmentsRepository) {}
  private readonly logger = new Logger(InstallmentsService.name);

  async findAll(params: InstallmentsParamsDTO) {
    try {
      return await this.installmentsRepository._findAll(params);
    } catch (error) {
      console.error(error);
      throw new FetchingInstallmentsError();
    }
  }

  async generateInstallmentsPayables(
    data: Payables,
    table: Tables,
  ): Promise<void> {
    const { recurrent } = data;

    if (recurrent) {
      await this.multipleInstallments({
        ...data,
        ...data.recurenceData,
        table,
      });
    } else {
      await this.singleInstallment({ ...data, table });
    }
  }

  async generateInstallmentsReceivables(
    data: Receivables,
    table: Tables,
    id?: number,
  ): Promise<void> {
    const { recurrent } = data;
    let hasInstallments = false;
    if (id) {
      hasInstallments =
        await this.installmentsRepository._receivableHasInstallments(id);
    }

    if (!hasInstallments) {
      if (recurrent) {
        await this.multipleInstallments({
          ...data,
          liquidValue: data.totalValue,
          ...data.recurenceData,
          table,
        });
      } else {
        await this.singleInstallment({
          ...data,
          liquidValue: data.totalValue,
          table,
        });
      }
    }
  }

  async addNewInstallmentsPayables(
    payable: Payables,
    newTotalValue: number,
  ): Promise<void> {
    if (!payable.installments?.length) return;

    const installmentsPaid = payable.installments.filter(
      (i) => i.status === InstallmentStatus.PAID,
    );
    const newAmount =
      newTotalValue - installmentsPaid.reduce((acc, i) => acc + i.value, 0);

    const { recurrent } = payable;

    await this.installmentsRepository.delete({
      payableId: payable.id,
      status: InstallmentStatus.PENDING,
    });

    if (recurrent) {
      const startDate =
        installmentsPaid.length === 0
          ? payable.recurenceData.startDate
          : installmentsPaid.reduce(
              (acc, i) => (isBefore(i.dueDate, acc) ? i.dueDate : acc),
              installmentsPaid[0].dueDate,
            );
      await this.multipleInstallments({
        ...payable,
        liquidValue: newAmount,
        installmentNumber: installmentsPaid.length,
        startDate,
        endDate: payable.recurenceData.endDate,
        dueDay: payable.recurenceData.dueDay,
        taxValue: 0,
        table: Tables.PAYABLES,
        id: payable.id,
        recurrenceType: payable.recurenceData.recurrenceType,
      });
    } else {
      await this.singleInstallment({
        ...payable,
        liquidValue: newTotalValue,
        table: Tables.PAYABLES,
      });
    }
  }

  async addNewInstallmentsReceivables(
    receivable: Receivables,
    newTotalValue: number,
  ): Promise<void> {
    if (!receivable.installments?.length) return;

    const installmentsPaid = receivable.installments.filter(
      (i) => i.status === InstallmentStatus.PAID,
    );
    const newAmount =
      newTotalValue - installmentsPaid.reduce((acc, i) => acc + i.value, 0);

    const { recurrent } = receivable;

    await this.installmentsRepository.delete({
      receivableId: receivable.id,
      status: InstallmentStatus.PENDING,
    });

    if (recurrent) {
      const startDate =
        installmentsPaid.length === 0
          ? receivable.recurenceData.startDate
          : installmentsPaid.reduce(
              (acc, i) => (isBefore(i.dueDate, acc) ? i.dueDate : acc),
              installmentsPaid[0].dueDate,
            );
      await this.multipleInstallments({
        ...receivable,
        liquidValue: newAmount,
        installmentNumber: installmentsPaid.length,
        startDate,
        endDate: receivable.recurenceData.endDate,
        dueDay: receivable.recurenceData.dueDay,
        taxValue: 0,
        table: Tables.RECEIVABLES,
        id: receivable.id,
        recurrenceType: receivable.recurenceData.recurrenceType,
      });
    } else {
      await this.singleInstallment({
        ...receivable,
        liquidValue: newTotalValue,
        table: Tables.RECEIVABLES,
      });
    }
  }

  async createInstallments(
    data: Array<CreateInstallmentDTO>,
  ): Promise<Installments[]> {
    try {
      return await this.installmentsRepository._create(data);
    } catch (error) {
      throw new CreatingInstallmentsError();
    }
  }

  async updateManyInstallmentsDate(
    data: UpdateInstallmentDTO[],
  ): Promise<void> {
    try {
      await this.installmentsRepository._updateManyInstallmentsDate(data);
    } catch (error) {
      console.error(error);
      throw new UpdateManyInstallmentsDate();
    }
  }

  async markAsPaid(id: number): Promise<void> {
    try {
      await this.installmentsRepository._markAsPaid(id);
    } catch (error) {
      throw new MarkAsPaidError();
    }
  }

  async markAsPending(id: number): Promise<void> {
    try {
      await this.installmentsRepository._markAsPending(id);
    } catch (error) {
      throw new MarkAsPaidError();
    }
  }

  async cancelReceivableInstallments(id: number): Promise<void> {
    try {
      await this.installmentsRepository._cancelReceivableInstallments(id);
    } catch (error) {
      throw new CancelError();
    }
  }

  async cancelPayableInstallments(id: number): Promise<void> {
    try {
      await this.installmentsRepository._cancelPayableInstallments(id);
    } catch (error) {
      throw new CancelError();
    }
  }

  async findResidualValueReceivable(id: number): Promise<number> {
    try {
      const { total } =
        await this.installmentsRepository._findResidualValueReceivable(id);
      return total ?? 0;
    } catch (error) {
      throw new CancelError();
    }
  }

  async findResidualValuePayable(id: number): Promise<number> {
    try {
      const { total } =
        await this.installmentsRepository._findResidualValuePayable(id);
      return total ?? 0;
    } catch (error) {
      throw new CancelError();
    }
  }

  async findByPayableId(
    id: number,
  ): ReturnType<typeof this.installmentsRepository._findByPayableId> {
    return await this.installmentsRepository._findByPayableId(id);
  }

  async findByReceivableId(
    id: number,
  ): ReturnType<typeof this.installmentsRepository._findByReceivableId> {
    return await this.installmentsRepository._findByReceivableId(id);
  }

  async findById(id: number) {
    return await this.installmentsRepository._findById(id);
  }

  async hasPendingInstallments(
    payableId: number | null,
    receivableId: number | null,
    installmentId: number,
  ) {
    try {
      return await this.installmentsRepository._hasPendingInstallments(
        payableId,
        receivableId,
        installmentId,
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async multipleInstallments({
    installmentNumber = 0,
    startDate,
    endDate,
    dueDay,
    liquidValue,
    taxValue,
    table,
    id,
    recurrenceType,
  }: MultipleInstallmentsProps) {
    const liquidInstallments: Array<CreateInstallmentDTO> = [];
    const taxInstallments: Array<CreateInstallmentDTO> = [];

    try {
      const interval = this.generateInterval(startDate, endDate, dueDay);
      const totalInstallments = this.numberOfInstallments(
        interval,
        startDate,
        dueDay,
        recurrenceType,
      );

      for (let i = 0; i < totalInstallments; i++) {
        const installment = new CreateInstallmentDTO(
          i + 1 + installmentNumber,
          totalInstallments,
          addMonths(interval[0], i),
          liquidValue / totalInstallments,
          InstallmentType.LIQUID,
          table === Tables.PAYABLES ? id : undefined,
          table === Tables.RECEIVABLES ? id : undefined,
        );
        liquidInstallments.push(installment);
      }
      const generatedLiquidInstallments =
        await this.createInstallments(liquidInstallments);

      if (taxValue) {
        for (let i = 0; i < totalInstallments; i++) {
          const installment = new CreateInstallmentDTO(
            i + 1 + installmentNumber,
            totalInstallments,
            addMonths(interval[0], i),
            taxValue / totalInstallments,
            InstallmentType.TAX,
            table === Tables.PAYABLES ? id : undefined,
            table === Tables.RECEIVABLES ? id : undefined,
            generatedLiquidInstallments?.[i]?.id,
          );
          taxInstallments.push(installment);
        }
        await this.createInstallments(taxInstallments);
      }
    } catch (error) {
      console.error(error);
      throw new GeneratingInstallmentsError();
    }
  }

  private async singleInstallment({
    dueDate,
    liquidValue,
    taxValue,
    table,
    id,
  }: SingleInstallmentProps) {
    try {
      const liquidInstallment = new CreateInstallmentDTO(
        1,
        1,
        dueDate,
        liquidValue,
        InstallmentType.LIQUID,
        table === Tables.PAYABLES ? id : undefined,
        table === Tables.RECEIVABLES ? id : undefined,
      );

      const generatedLiquidInstallment = await this.createInstallments([
        liquidInstallment,
      ]);
      if (taxValue) {
        const taxInstallment = new CreateInstallmentDTO(
          1,
          1,
          dueDate,
          taxValue,
          InstallmentType.TAX,
          table === Tables.PAYABLES ? id : undefined,
          table === Tables.RECEIVABLES ? id : undefined,
          generatedLiquidInstallment?.[0]?.id,
        );
        await this.createInstallments([taxInstallment]);
      }
    } catch (error) {
      console.error(error);
      throw new GeneratingInstallmentsError();
    }
  }

  private generateInterval = (
    startDate: Date,
    endDate: Date,
    dueDay: number,
  ) => {
    const interval: Date[] = [];

    if (startDate.getDate() > dueDay) {
      interval.push(addMonths(set(startDate, { date: dueDay }), 1));
    } else {
      interval.push(set(startDate, { date: dueDay }));
    }

    while (true) {
      const lastDate = interval.at(-1);

      if (!lastDate) break;

      const newDate = addMonths(lastDate, 1);

      if (isBefore(newDate, endDate) || isEqual(newDate, endDate)) {
        interval.push(newDate);
      } else {
        break;
      }
    }

    return interval;
  };

  private numberOfInstallments = (
    interval: Date[],
    startDate: Date,
    dueDay: number,
    recurrenceType: RecurrenceType,
  ) => {
    let result = 0;

    switch (recurrenceType) {
      case RecurrenceType.MONTHLY:
        result = interval.length;
        break;
      case RecurrenceType.QUARTERLY:
        result = interval.length / 3;
        break;
      case RecurrenceType.BIANNUAL:
        result = interval.length / 6;
        break;
      case RecurrenceType.ANNUALLY:
        result = interval.length / 12;
        break;
      case RecurrenceType.BIMONTLY:
        result = interval.length / 2;
        break;
      default:
        return 0;
    }

    if (result < 1) return 0;

    return startDate.getDate() > dueDay
      ? Math.floor(result)
      : Math.ceil(result);
  };

  async manageOverdueInstallments(): Promise<
    Pick<Installments, "payableId" | "receivableId">[]
  > {
    try {
      const {
        result: { affected },
        ids,
      } = await this.installmentsRepository._handleOverdueInstallments();
      this.logger.log(
        `Parcelas vencidas atualizadas com sucesso. ${affected} linhas afetadas.`,
      );
      return ids;
    } catch (error) {
      this.logger.log("Erro ao atualizar parcelas vencidas.", error);
    }
  }
}
