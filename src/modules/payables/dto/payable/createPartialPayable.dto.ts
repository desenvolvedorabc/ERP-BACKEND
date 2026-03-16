import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { PayableStatus } from "../../enums";
import { CreatePayableDTO } from "./createPayable.dto";

export class CreatePartialPayableDTO extends PartialType(
  PickType(CreatePayableDTO, [
    "contractId",
    "supplierId",
    "collaboratorId",
    "liquidValue",
    "taxValue",
    "paymentType",
    "createdById",
    "debtorType",
  ]),
) {
  @ApiProperty()
  @IsEnum(PayableStatus)
  @IsNotEmpty()
  payableStatus: PayableStatus;
}
