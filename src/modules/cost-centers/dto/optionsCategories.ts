import { ApiProperty } from "@nestjs/swagger";

export class optionsCategories {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  parentId: number;
}
