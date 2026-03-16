import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";
import { parseISO, set } from "date-fns";

export class DueBetweenDTO {
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) =>
    set(parseISO(value), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
  )
  start: Date;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) =>
    set(parseISO(value), {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    }),
  )
  end: Date;
}
