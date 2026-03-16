import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { parseISO, set } from "date-fns";

export class ContractPeriodDTO {
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) =>
    set(parseISO(value), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
  )
  start: Date;

  @ValidateIf((o) => !o.isIndefinite)
  @IsDate()
  @IsNotEmpty({ message: "A data de término é obrigatória quando o prazo não é indeterminado" })
  @Transform(({ value }) => {
    if (!value) return null;
    return set(parseISO(value), {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    });
  })
  end: Date;

  @IsOptional()
  @IsBoolean()
  isIndefinite?: boolean;
}
//