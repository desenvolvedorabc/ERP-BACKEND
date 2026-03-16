import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { CreateContractDTO } from "./createContract.dto";

export class UpdateContractDTO extends PartialType(CreateContractDTO) {
  @IsNumber()
  @IsNotEmpty()
  updatedBy: number;
}
