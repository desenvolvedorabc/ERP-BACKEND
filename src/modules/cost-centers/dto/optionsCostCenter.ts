import { ApiProperty } from "@nestjs/swagger";

export class optionsCostCenter {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  parentId: number;
}
