import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { RecurrenceType } from "../../modules/payables/enums";

export class RecurenceDataDTO {
  @ApiProperty()
  @IsEnum(RecurrenceType)
  @IsNotEmpty({
    message: "Tipo de recorrencia obrigatório.",
  })
  recurrenceType: RecurrenceType;

  @ApiProperty()
  @IsDate({
    message: "Data de início inválida.",
  })
  @IsNotEmpty({
    message: "Data de início obrigatória.",
  })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDate({
    message: "Data de fim inválida.",
  })
  @IsNotEmpty({
    message: "Data fim obrigatória.",
  })
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Dia de vencimento deve ser um número",
  })
  @IsNotEmpty({
    message: "Dia de vencimento obrigatória.",
  })
  @Type(() => Number)
  dueDay: number;
}
