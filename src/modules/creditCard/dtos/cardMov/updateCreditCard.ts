import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateCardMovimentationDTO } from "./createCardMov.dto";

export class UpdateCardMovDTO extends PartialType(
  OmitType(CreateCardMovimentationDTO, ["cardId"]),
) {}
