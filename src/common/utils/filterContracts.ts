import { Contracts } from "src/modules/contracts/entities/contracts.entity";

// * Este código está horrivel, mas é o que tem pra hoje.

export function filterContracts(contracts: Contracts[], exception?: number) {
  if (!contracts || contracts.length === 0) return [];

  const groups = new Map<number, Contracts[]>();

  contracts.forEach((contract) => {
    const groupId = contract.parentId ?? contract.id;
    const list = groups.get(groupId) ?? [];
    list.push(contract);
    groups.set(groupId, list);
  });

  let filteredContracts: Contracts[] = Array.from(groups.values())
    .map((list) => list.sort((a, b) => b.id - a.id)[0])
    .filter(Boolean);

  const exceptionContract = filteredContracts.find(
    (contract) =>
      (contract.payable && contract.payable.some((p) => p.id === exception)) ||
      (contract.receivable &&
        contract.receivable.some((r) => r.id === exception)),
  );

  if (exceptionContract) {
    filteredContracts = filteredContracts.filter(
      (contract) => contract !== exceptionContract,
    );
    return [exceptionContract, ...filteredContracts];
  }

  return filteredContracts;
}
