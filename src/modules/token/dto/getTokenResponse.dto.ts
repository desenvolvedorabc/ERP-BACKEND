import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetTokenResponseDTO {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsNotEmpty()
  token_type: string;

  @IsNumber()
  @IsNotEmpty()
  expires_in: number;
}
