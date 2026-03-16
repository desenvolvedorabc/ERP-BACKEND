import { ApiProperty } from "@nestjs/swagger";

export class optionsPartnerMunicipality {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  parentId: number;
}
