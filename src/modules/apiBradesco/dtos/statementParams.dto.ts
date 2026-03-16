import { IsNotEmpty, IsString } from "class-validator";

export class statementParamsDTO {
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

  @IsNotEmpty({
    message: "Data inicio é obrigatória",
  })
  dataInicio: string;

  @IsNotEmpty({
    message: "Data fim é obrigatória",
  })
  dataFim: string;

  @IsNotEmpty({ message: "Tipo é obrigatório" })
  tipo: string;
}
