import { ApiProperty } from "@nestjs/swagger";

export class GenericOptions {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
