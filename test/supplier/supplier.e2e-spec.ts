import { CategorySupplier, PixTypes } from "src/modules/suppliers/enum";
import { SuppliersService } from "src/modules/suppliers/suppliers.service";
import { SuppliersRepository } from "../../src/modules/suppliers/repositories/typeorm/suppliers-repository";

describe("supplier controller", () => {
  let service: SuppliersService;
  let suppliersRepository: SuppliersRepository;

  const body = {
    name: "teste supplier",
    email: "teste@example.com",
    cnpj: "51.283.132/0001-09",
    corporateName: "teste corporate name",
    fantasyName: "teste fantasy name",
    serviceCategory: CategorySupplier.AGUA,
    commentEvaluation: "teste comment evaluation",
    serviceEvaluation: 123,
    bancaryInfo: {
      bank: "santander",
      agency: "0001",
      accountNumber: "000123456789",
      dv: "conta corrente",
    },
    pixInfo: {
      key_type: PixTypes.CPF,
      key: "822.729.830-30",
    },
  };

  beforeEach(() => {
    suppliersRepository = {
      _create: jest.fn(),
    } as any;

    service = new SuppliersService(suppliersRepository);
    jest.spyOn(service, "create").mockResolvedValue();
  });

  it("should create a new supplier", async () => {
    await service.create(body);
    expect(suppliersRepository._create).toHaveBeenCalledWith(body);
  });
});
