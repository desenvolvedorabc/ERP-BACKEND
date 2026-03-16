import { ApiProperty } from "@nestjs/swagger";

export class optionsBudgetPlan {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  parentId: number;
}
