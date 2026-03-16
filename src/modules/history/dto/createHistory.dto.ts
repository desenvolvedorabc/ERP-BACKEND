import { IsEnum, IsNumber } from "class-validator";
import { ActionTypes } from "../enums";

export class CreateHistoryDTO {
  @IsEnum(ActionTypes)
  actionType: ActionTypes;

  @IsNumber()
  contractId: number;

  @IsNumber()
  userId: number;
}
