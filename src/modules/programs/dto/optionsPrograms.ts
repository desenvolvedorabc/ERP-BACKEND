import { ApiProperty } from "@nestjs/swagger";

export class optionsPrograms {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
