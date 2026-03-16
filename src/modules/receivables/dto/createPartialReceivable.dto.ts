import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ReceivableStatus } from "./../enums/index";
import { CreateReceivableDTO } from "./createReceivable.dto";

export class CreatePartialReceivableDTO extends PickType(CreateReceivableDTO, [
  "contractId",
  "financierId",
  "receivableType",
  "totalValue",
]) {
  @ApiProperty()
  @IsEnum(ReceivableStatus)
  @IsNotEmpty()
  receivableStatus: ReceivableStatus;
}
