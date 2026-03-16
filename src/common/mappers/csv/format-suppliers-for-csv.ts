import { formatCnpj } from "src/common/utils/formats";
import { Supplier } from "src/modules/suppliers/entities/supplier.entity";

export function formatSuppliersForCsv(suppliers: Supplier[]) {
  const data = suppliers.map((supplier) => {
    return {
      nome: supplier?.name ?? "N/A",
      email: supplier?.email ?? "N/A",
      cnpj: supplier?.cnpj ? formatCnpj(supplier.cnpj) : "N/A",
      razao_social: supplier?.corporateName ?? "N/A",
      nome_fantasia: supplier?.fantasyName ?? "N/A",
      categoria_servico: supplier?.serviceCategory ?? "N/A",
      avaliacao_servico: supplier?.serviceEvaluation ?? "N/A",
      comentario_avaliacao: supplier?.commentEvaluation ?? "N/A",
      ativo: supplier.active ? "Sim" : "Não",
    };
  });

  return {
    data,
  };
}
