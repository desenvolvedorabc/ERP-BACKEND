import { IsNotEmpty, IsNumber } from "class-validator";
import { CreateContractDTO } from "./createContract.dto";

export class CreateAditiveDTO extends CreateContractDTO {
  @IsNumber()
  @IsNotEmpty()
  parentId: number;

  @IsNumber()
  @IsNotEmpty()
  createdById: number;
}
