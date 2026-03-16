import { IsNotEmpty, IsString } from "class-validator";

export class balanceParamsDTO {
  @IsString({
    message: "Agência deve ser uma string",
  })
  @IsNotEmpty({
    message: "Agência é obrigatória",
  })
  agencia: string;

  @IsString({
    message: "Conta deve ser uma string",
  })
  @IsNotEmpty({
    message: "Conta é obrigatória",
  })
  conta: string;
}
