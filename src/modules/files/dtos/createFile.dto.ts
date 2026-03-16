import { ApiProperty } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";
import { parseNumber } from "src/common/decorators/parseNumber.decorator";

export class CreateFilesDTO {
  @ApiProperty()
  @ValidateIf(({ value }) => !!value)
  @parseNumber()
  payableId: number | null;

  @ApiProperty()
  @ValidateIf(({ value }) => !!value)
  @parseNumber()
  receivableId: number | null;

  @ApiProperty()
  @ValidateIf(({ value }) => !!value)
  @parseNumber()
  contractId: number | null;

  @ApiProperty()
  @ValidateIf(({ value }) => !!value)
  @parseNumber()
  userId: number | null;

  constructor(
    payableId?: number,
    receivableId?: number,
    contractId?: number,
    userId?: number,
  ) {
    this.payableId = payableId ?? null;
    this.receivableId = receivableId ?? null;
    this.contractId = contractId ?? null;
    this.userId = userId ?? null;
  }
}
