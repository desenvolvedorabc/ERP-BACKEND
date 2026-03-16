import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { CreateContractDTO } from "./createContract.dto";

export class PartialAccountDataDTO extends PickType(CreateContractDTO, [
  "financierId",
  "collaboratorId",
  "supplierId",
  "totalValue",
  "contractType",
]) {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  contractId: number;
}
