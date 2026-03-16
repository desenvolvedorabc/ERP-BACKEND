import { ApiProperty } from "@nestjs/swagger";

export class UserData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  massApprovalPermission: boolean;
}

export class optionsCollaborators {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty({ type: UserData, required: false })
  user?: UserData;
}
