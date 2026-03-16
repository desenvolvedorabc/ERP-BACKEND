import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class SelectedIdsPayablesDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  selectedIds: number[];
}
