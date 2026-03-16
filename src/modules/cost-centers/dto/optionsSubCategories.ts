import { ApiProperty } from "@nestjs/swagger";

export class optionsSubCategories {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  parentId: number;
}
