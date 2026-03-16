/*
https://docs.nestjs.com/providers#services
*/

import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  CreatingMovimentationError,
  DeletingMovimentationError,
  FindMovimentationError,
  GeneratePartialPayableError,
  NotFoundMovimentation,
  NotFoundMovimentationsError,
  UpdatingMovimentationError,
} from "../errors";
import { CardMovimentationRepository } from "../repositories/cardMov-repository";
import { CreateCardMovimentationDTO } from "../dtos/cardMov/createCardMov.dto";
import { CardMovParams } from "../dtos/cardMov/paginateParamsCardMov.dto";
import { CardMovimentation } from "../entities/cardMovimentation.entity";
import { UpdateCardMovDTO } from "../dtos/cardMov/updateCreditCard";
import {
  endOfMonth,
  getDay,
  getMonth,
  setDate,
  setMonth,
  startOfDay,
} from "date-fns";
import {
  DebtorType,
  DOCType,
  PayableStatus,
  PaymentMethod,
  PaymentType,
} from "src/modules/payables/enums";
import { CardMovimentationValidator } from "../validations/cardMov.validate";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { formatCardMovForCSV } from "src/common/mappers/csv/format-cardMovs-for-csv";
import { randomUUID } from "crypto";
import { CategorizationService } from "src/modules/categorization/categorization.service";
import { RelationType } from "src/modules/categorization/enums";
import { SuppliersService } from "src/modules/suppliers/suppliers.service";
import { PayableService } from "src/modules/payables/services/payable.service";

@Injectable()
export class CardMovService {
  constructor(
    private cardMovRepository: CardMovimentationRepository,
    @Inject(forwardRef(() => PayableService))
    private payableService: PayableService,
    private categorizationService: CategorizationService,
    private validator: CardMovimentationValidator,
    private suppliersService: SuppliersService,
  ) {}

  async create(data: CreateCardMovimentationDTO) {
    try {
      const installmentId: string = randomUUID();
      const { categorization, ...createData } = data;
      let movimentations: Omit<CreateCardMovimentationDTO, "categorization">[] =
        [];
      if (data.hasInstallments) {
        movimentations = this.generateInstallmentsMov(
          createData,
          installmentId,
        );
      } else {
        movimentations = [
          {
            ...createData,
            referenceDate: createData.purchaseDate,
            installmentId,
          },
        ];
      }
      if (movimentations.length > 0) {
        const result = await this.cardMovRepository._create(movimentations);
        await this.categorizationService.createMany(
          categorization,
          RelationType.CARDMOV,
          result.map((mov) => Number(mov.id)),
        );
      } else {
        throw new Error("Nenhuma movimentação encontrada");
      }
    } catch (error) {
      console.error(error);
      throw new CreatingMovimentationError();
    }
  }

  async findAll(params: CardMovParams): Promise<CardMovimentation[]> {
    try {
      const movimentations = await this.cardMovRepository._findAll(params);

      if (movimentations.length === 0) throw new NotFoundMovimentationsError();

      return movimentations;
    } catch (error) {
      console.error(error);
      throw new FindMovimentationError();
    }
  }

  async findAllInCsv(params: CardMovParams) {
    const items = await this.cardMovRepository._findAllForCSV(params);

    const data = formatCardMovForCSV(items);

    if (!data?.length) {
      throw new NotFoundMovimentationsError();
    }

    const { csvData } = generateCsv(data);

    return {
      csvData,
    };
  }

  async findById(id: number): Promise<CardMovimentation> {
    try {
      await this.validator.Exists(id);

      const movimentation = await this.cardMovRepository._findById(id);

      if (!movimentation) throw new NotFoundMovimentation();

      return movimentation;
    } catch (error) {
      console.error(error);
      throw new FindMovimentationError();
    }
  }

  async update(id: number, data: UpdateCardMovDTO) {
    try {
      await this.validator.Exists(id);
      const { categorization, ...updateData } = data;
      await this.cardMovRepository._update(id, updateData);
      await this.categorizationService.update(
        id,
        RelationType.CARDMOV,
        categorization,
      );
    } catch (error) {
      console.error(error);
      throw new UpdatingMovimentationError();
    }
  }

  async delete(uuid: string): Promise<void> {
    try {
      await this.validator.ExistsByUUID(uuid);

      await this.cardMovRepository._deleteByUUID(uuid);
    } catch (error) {
      console.error(error);
      throw new DeletingMovimentationError();
    }
  }

  async markAsUnprocessed(payableId: number): Promise<void> {
    try {
      await this.cardMovRepository._markAsUnprocessed(payableId);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Falha ao marcar movimentações como não processadas",
      );
    }
  }

  async processMovimentations(
    params: CardMovParams,
  ): Promise<{ payableId: number }> {
    try {
      const { value, dueDay, accountId } =
        await this.cardMovRepository._findAllForPayable(params);
      const { id: supplierId } = await this.suppliersService.findBradesco();

      if (!value) {
        throw new NotFoundException();
      }

      const payable = await this.payableService.createCreditCardBill({
        payableStatus: PayableStatus.APPROVED,
        paymentType: PaymentType.CARDBILL,
        liquidValue: value,
        taxValue: 0,
        totalValue: value,
        debtorType: DebtorType.SUPPLIER,
        paymentMethod: PaymentMethod.BILL,
        createdById: params.userId,
        accountId,
        recurrent: false,
        dueDate: this.generateDueDate(dueDay),
        supplierId,
        docType: DOCType.NF,
      });

      await this.cardMovRepository._markAsProcessed(params, payable.id);
      return { payableId: payable.id };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException("Nenhuma movimentação encontrada");
      }
      throw new GeneratePartialPayableError();
    }
  }

  private generateInstallmentsMov(
    data: Omit<CreateCardMovimentationDTO, "categorization">,
    installmentId: string,
  ) {
    const installmentsMov: Array<typeof data> = [];
    for (let i = 0; i < data.numberOfInstallments; i++) {
      installmentsMov.push({
        ...data,
        installmentId,
        value: data.value / data.numberOfInstallments,
        currentInstallment: i + 1,
        referenceDate: setMonth(
          data.purchaseDate,
          getMonth(data.purchaseDate) + i,
        ),
      });
    }

    return installmentsMov;
  }

  private generateDueDate(dueDay: number) {
    const currentDay = new Date();
    const lastDayOfMonth = endOfMonth(currentDay);

    if (dueDay > getDay(lastDayOfMonth)) {
      return startOfDay(lastDayOfMonth);
    }
    return setDate(startOfDay(currentDay), dueDay);
  }
}
