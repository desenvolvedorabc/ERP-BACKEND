import { PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { CreateContractDTO } from "./createContract.dto";

export class UpdateContractBancaryInfo extends PickType(CreateContractDTO, [
  "bancaryInfo",
  "pixInfo",
]) {
  @IsNumber()
  @IsNotEmpty()
  updatedBy: number;
}
