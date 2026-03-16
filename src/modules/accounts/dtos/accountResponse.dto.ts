import { Accounts } from "../entities/accounts.entity";

export class AccountResponseDTO extends Accounts {
  pendingReconciliations: number;
}
