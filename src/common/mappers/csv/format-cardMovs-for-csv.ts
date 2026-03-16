import { formatDate } from "src/common/utils/date";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";

export function formatCardMovForCSV(movimentations: CardMovimentation[]) {
  return movimentations.map((mov) => ({
    descricao: mov.description ?? "N/A",
    data_de_compra: formatDate(mov.purchaseDate),
    data_referencia: formatDate(mov.referenceDate),
    parcelado: mov.hasInstallments ? "SIM" : "NÃO",
    numero_parcelas: mov.numberOfInstallments,
    parcela_numero: mov.currentInstallment,
    valor: mov.value,
    cartao: mov.card?.name ?? "N/A",
    status: mov.status,
  }));
}
