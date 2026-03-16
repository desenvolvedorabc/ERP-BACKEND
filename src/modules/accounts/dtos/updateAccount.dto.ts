import { CreateAccountDTO } from "./createAccount.dto";
import { PickType } from "@nestjs/swagger";

export class UpdateAccountDTO extends PickType(CreateAccountDTO, ["name"]) {}
