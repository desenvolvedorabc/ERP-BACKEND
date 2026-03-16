import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";

export class CardMovParams {
  @ValidateNested()
  @Type(() => DueBetweenDTO)
  dueBetween: DueBetweenDTO;

  @IsNumber()
  @IsNotEmpty({ message: "Número do cartão é obrigatório" })
  @Type(() => Number)
  cardId: number;

  @IsNumber()
  @IsNotEmpty({ message: "Id do usuário é obrigatório." })
  @Type(() => Number)
  userId: number;
}
