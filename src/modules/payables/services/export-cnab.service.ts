/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
import { Injectable } from "@nestjs/common";
import { subMinutes } from "date-fns";
import * as fs from "fs";
import { PayablesRepository } from "../repositories/payable-repository";
import { SelectedIdsPayablesDTO } from "../dto/payable/selectedIdsPayable.dto";
import {
  ProcessRemessaData,
  RemessaGateway,
} from "src/common/gateways/cnab/remessa.gateway";
import { Payables } from "../entities/payable.entity";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { PaymentMethod } from "../enums";
import { InstallmentStatus } from "src/modules/installments/enum";
import {
  InvalidPayableDataCnabError,
  InvalidPaymentTypeError,
  NotFoundInstallmentError,
  PayableBankAccountNotFoundError,
  PayableDocumentFoundError,
  PayablePixNotFoundError,
  PayableStatusError,
  SendingCnabError,
} from "../errors/CnabErrors";
import * as _ from "lodash";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import {
  CodCamaraCentralizadora,
  FormaLancamento,
  IdentificacaoFavorecidoChavePix,
  CodigoMovimento,
  TipoDocumento,
  TipoMovimento,
  TipoServico,
  ComplementoTipoServico,
  ComplementoTipoServicoTED,
} from "src/common/gateways/cnab/enums";
import { SegmentoA } from "src/common/gateways/cnab/layout/Bradesco/Pagamento/SegmentoA";
import { SegmentoB } from "src/common/gateways/cnab/layout/Bradesco/Pagamento/SegmentoB";
import { TransferFileSftpGateway } from "src/common/gateways/transfer-file-sftp/transfer-file-sftp.gateway";
import { SegmentoBPix } from "src/common/gateways/cnab/layout/Bradesco/Pagamento/SegmentoBPix";
import {
  FavorecidoBankKeys,
  LotePayment,
} from "src/common/gateways/cnab/types";
import { SegmentoJ } from "src/common/gateways/cnab/layout/Bradesco/Pagamento/SegmentoJ";
import { PixInfo } from "src/common/DTOs/pixInfo.entity";
import { addLeadingZeros, isBradescoBarcode } from "../utils";
import { CONFIG_ABC } from "../constants";
import { SegmentoJ52 } from "src/common/gateways/cnab/layout/Bradesco/Pagamento";

type DetailData = {
  countSegment: number;
  payable: Payables;
  paymentDate: Date;
  mode: PaymentMethod;
  countLotes: number;
  forma_lancamento: FormaLancamento;
};
type KeysBaseSegmentB =
  | "cod_seg_registro_lote"
  | "lote"
  | "num_seq_registro_lote"
  | "movimento_tipo"
  | "movimento_cod"
  | "doc_empresa"
  | "data_pagamento"
  | "valor_pagamento";

@Injectable()
export class ExportCnabPayableService {
  private empresa_nome = "ASSOCIACAO BEM COMUM";
  constructor(
    private payablesRepository: PayablesRepository,
    private transferFile: TransferFileSftpGateway,
    private remessa: RemessaGateway
  ) {}

  async create(data: SelectedIdsPayablesDTO) {
    const payables = await this.payablesRepository._findByIds(data.selectedIds);

    if (payables.length === 0 || payables.length !== data.selectedIds.length) {
      throw new PayableStatusError();
    }
    const groupedAccounts = _.groupBy(payables, (item) => item.account.id);

    // gera o arquivo de remessa pra cada conta
    const pathsRemessas: { fileName: string; content: string }[] = [];
    for (const accountId in groupedAccounts) {
      if (Object.prototype.hasOwnProperty.call(groupedAccounts, accountId)) {
        const payablesByAccount = groupedAccounts[accountId];
        const account = payablesByAccount[0].account;
        const remessas = this.generateRemessaByPaymentMethod(
          account,
          payablesByAccount
        );
        for (const remessa of remessas) {
          const pathRemessa = this.saveLocalRemessaFile(
            remessa,
            account.id,
            remessa.ArquivoHeader?.header_PIX || "pagamento"
          );
          pathsRemessas.push(pathRemessa);
        }
      }
    }

    try {
      await this.transferFile.sendFilesToVanBradesco(pathsRemessas);
    } catch (error) {
      console.error(error);
      throw new SendingCnabError();
    }
  }

  /**
   * criar remessa para pagamento TED/DOC ou PIX
   */
  private generateRemessaByPaymentMethod(
    account: Accounts,
    payables: Payables[]
  ) {
    const date = new Date();

    const currentDate = subMinutes(date, 180);

    const remessas: ProcessRemessaData[] = [];

    const lotes: LotePayment[] = [];
    let countLotes = 1;

    const payablesPix = payables.filter(
      (p) => p.paymentMethod === PaymentMethod.PIX
    );
    const payablesTedDoc = payables.filter((p) =>
      [PaymentMethod.TED, PaymentMethod.DOC].includes(p.paymentMethod)
    );
    const payablesBill = payables.filter(
      (p) => p.paymentMethod === PaymentMethod.BILL
    );

    if (payablesPix.length > 0) {
      const lotePix = this.generateLotePayment({
        account,
        payables: payablesPix,
        countLotes,
        forma_lancamento: FormaLancamento.PIX_TRANSFERENCIA,
        tipo_servico: TipoServico.PAGAMENTO_FORNECEDORES,
        versao_layout: "045",
        forma_pgto_servico: "01",
      });
      remessas.push(
        this.generateCompleteRemessaFile(
          currentDate,
          [lotePix],
          account,
          PaymentMethod.PIX
        )
      );
    }

    if (payablesTedDoc.length > 0) {
      const payable = payablesTedDoc[0];

      const { favorecido_cod_banco } = this.getBankData(payable);

      const loteTedDoc = this.generateLotePayment({
        account,
        payables: payablesTedDoc,
        countLotes,
        forma_lancamento:
          favorecido_cod_banco === "237"
            ? FormaLancamento.CREDITO_CC
            : FormaLancamento.TED_OUTRA_TITULARIDADE,
        tipo_servico: TipoServico.PAGAMENTO_FORNECEDORES,
        versao_layout: "045",
        forma_pgto_servico: "01",
      });
      lotes.push(loteTedDoc);
      countLotes++;
    }

    if (payablesBill.length > 0) {
      const payable = payablesBill[0];

      const forma_lancamento = isBradescoBarcode(payable.barcode)
        ? FormaLancamento.LIQUIDACAO_TITULOS_BANCO
        : FormaLancamento.PGTO_TITULOS_OUTRO_BANCO;
      const loteBill = this.generateLotePayment({
        account,
        payables: payablesBill,
        countLotes,
        forma_lancamento,
        tipo_servico: TipoServico.PAGAMENTO_FORNECEDORES,
        versao_layout: "040",
        forma_pgto_servico: "  ",
      });
      lotes.push(loteBill);
      countLotes++;
    }

    if (lotes.length > 0) {
      remessas.push(
        this.generateCompleteRemessaFile(
          currentDate,
          lotes,
          account,
          PaymentMethod.TED
        )
      );
    }

    return remessas;
  }

  private generateLotePayment({
    account,
    countLotes,
    forma_lancamento,
    tipo_servico,
    payables,
    versao_layout,
    forma_pgto_servico,
  }: {
    account: Accounts;
    payables: Payables[];
    countLotes: number;
    forma_lancamento: FormaLancamento;
    tipo_servico: TipoServico;
    versao_layout: string;
    forma_pgto_servico: string;
  }): LotePayment {
    const date = new Date();

    const currentDate = subMinutes(date, 180);

    const amount = this.convertToCents(
      payables.reduce((acc, payable) => acc + payable.liquidValue, 0)
    );
    let countSegment = 1;
    const details: (
      | SegmentoA
      | SegmentoB
      | SegmentoBPix
      | SegmentoJ
      | SegmentoJ52
    )[] = [];

    for (const payable of payables) {
      const detailData = this.generateDetail({
        payable,
        paymentDate: currentDate,
        countSegment,
        mode: payable.paymentMethod,
        countLotes,
        forma_lancamento,
      });
      countSegment += detailData.length;
      details.push(...detailData);
    }
    const [conta_agencia, agencia_dig_verificador] = this.splitAgency(
      account.agency
    );
    return {
      LoteHeader: {
        lote: countLotes.toString(),
        servico: tipo_servico,
        forma_lancamento,
        empresa_tipo_insc: TipoDocumento.CNPJ,
        empresa_num_insc: CONFIG_ABC.empresa_num_insc,
        convenio: CONFIG_ABC.convenio,
        conta_agencia,
        agencia_dig_verificador,
        conta_num: account.accountNumber,
        conta_dig_verificador: account.dv,
        empresa_nome: this.empresa_nome,
        versao_layout,
        forma_pgto_servico,
      },
      Details: details,
      LoteTrailing: {
        qtde_registros: (details.length + 2).toString(),
        somatoria_valores: amount,
      },
    };
  }

  /**
   * Gera o arquivo de remessa completo
   */
  private generateCompleteRemessaFile(
    currentDate: Date,
    lotes: LotePayment[],
    account: Accounts,
    paymentMethod: PaymentMethod
  ): ProcessRemessaData {
    const [conta_agencia, agencia_dig_verificador] = this.splitAgency(
      account.agency
    );

    const countDetails = lotes.reduce(
      (acc, lote) => acc + lote.Details.length,
      0
    );
    const remessa: ProcessRemessaData = {
      ArquivoHeader: {
        empresa_inscricao_tipo: TipoDocumento.CNPJ,
        empresa_inscricao_num: CONFIG_ABC.empresa_num_insc,
        convenio: CONFIG_ABC.convenio,
        empresa_nome: this.empresa_nome,
        nome_banco: CONFIG_ABC.nome_banco,
        arquivo_data_geracao: this.getFormattedDate(currentDate),
        arquivo_hora_geracao: this.getFormattedTime(currentDate),
        arquivo_sequencia: "1",
        conta_agencia,
        agencia_dig_verificador,
        conta_num: account.accountNumber,
        conta_dig_verificador: account.dv,
        header_PIX: paymentMethod === PaymentMethod.PIX ? "PIX" : undefined,
      },
      lotes,
      ArquivoTrailing: {
        qtde_lotes: lotes.length.toString(),
        qtde_registros: (2 + lotes.length * 2 + countDetails).toString(), // Quantidade de linhas https://www.projetoacbr.com.br/forum/topic/31985-quantidade-de-registros-do-lote-e-do-arquivo-erradas/
      },
    };

    return remessa;
  }

  /**
   * Salva o arquivo de remessa localmente e retorna o caminho
   */
  private saveLocalRemessaFile(
    remessa: ProcessRemessaData,
    accountId: number,
    method: string
  ): { fileName: string; content: string } {
    const typePayment = remessa.ArquivoHeader?.header_PIX
      ? "pagamentoPix"
      : "pagamento";
    const processed = this.remessa.process(remessa, typePayment);

    const fileName = `${Date.now()}.txt`;

    // const dir = `./cnab/remessa`;
    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir, { recursive: true });
    // }

    // fs.writeFile(`${dir}/${fileName}`, processed, async (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });
    return {
      fileName,
      content: processed,
    };
  }

  /**
   * Gera os detalhes do arquivo de remessa com Segmento A e B ou BPIX
   */
  private generateDetail({
    payable,
    paymentDate,
    countSegment: seg_lote,
    mode,
    countLotes,
    forma_lancamento,
  }: DetailData) {
    const { liquidValue, installments, recurrent } = payable;
    let dueDate = payable.dueDate;
    let amount = liquidValue;

    if (recurrent) {
      const currentInstallment = this.getCurrentInstallment(
        installments,
        paymentDate
      );
      if (!currentInstallment) {
        throw new NotFoundInstallmentError(payable?.obs || "sem descrição");
      }

      amount = currentInstallment?.value;
      dueDate = currentInstallment?.dueDate;
    }
    const valor_documento = this.convertToCents(amount);

    const data_pagamento = this.getFormattedDate(paymentDate);
    if (!dueDate)
      throw new InvalidPayableDataCnabError(
        "data de vencimento",
        payable.id.toString()
      );
    const data_vencimento = this.getFormattedDate(new Date(dueDate));

    const baseSegmentoA: Pick<SegmentoA, KeysBaseSegmentB> = {
      cod_seg_registro_lote: "A",
      lote: countLotes.toString(),
      num_seq_registro_lote: seg_lote.toString(),
      movimento_tipo: TipoMovimento.INCLUSAO,
      movimento_cod: CodigoMovimento.INCLUSAO_BLOQUEADO,
      doc_empresa: `${payable.account.id}-${payable.id}`,
      data_pagamento,
      valor_pagamento: valor_documento,
    };

    let segmentoA: SegmentoA;
    let segmentoB: SegmentoB | SegmentoBPix;

    switch (mode) {
      case PaymentMethod.PIX:
        segmentoA = this.createSegmentoA(baseSegmentoA, {
          cod_camara: CodCamaraCentralizadora.PIX,
          ...this.getBankData(payable),
        });
        segmentoB = this.createSegmentoBPix(
          {
            ...this.getDocumentFavorecido(payable),
            ...this.mapperPixInitiationData(payable),
            lote: countLotes.toString(),
          },
          seg_lote
        );
        return [segmentoA, segmentoB];
      case PaymentMethod.TED:
        segmentoA = this.createSegmentoA(
          baseSegmentoA,
          forma_lancamento === FormaLancamento.CREDITO_CC
            ? {
                ...this.getBankData(payable),
                cod_camara: CodCamaraCentralizadora.CC,
              }
            : {
                ...this.getBankData(payable),
                cod_camara: CodCamaraCentralizadora.TED,
                cod_finalidade_compl: "CC",
                cod_finalidade_ted: ComplementoTipoServicoTED.CREDITO_CONTA,
              }
        );
        segmentoB = this.createSegmentoB(
          {
            ...this.getDocumentFavorecido(payable),
            data_vencimento,
            valor_documento,
            lote: countLotes.toString(),
          },
          seg_lote
        );
        return [segmentoA, segmentoB];
      case PaymentMethod.DOC:
        segmentoA = this.createSegmentoA(baseSegmentoA, {
          cod_camara: CodCamaraCentralizadora.DOC,
          ...this.getBankData(payable),
          cod_finalidade_compl: "CC",
          cod_finalidade_doc: ComplementoTipoServico.PAGAMENTO_FORNECEDORES,
        });
        segmentoB = this.createSegmentoB(
          {
            ...this.getDocumentFavorecido(payable),
            data_vencimento,
            valor_documento,
            lote: countLotes.toString(),
          },
          seg_lote
        );

        return [segmentoA, segmentoB];
      case PaymentMethod.BILL:
        if (!payable?.barcode)
          throw new InvalidPayableDataCnabError(
            "código de barras",
            payable.id.toString()
          );

        const segmentoJ: SegmentoJ = {
          cod_seg_registro_lote: "J",
          lote: countLotes.toString(),
          num_seq_registro_lote: seg_lote.toString(),
          movimento_tipo: TipoMovimento.INCLUSAO,
          movimento_cod: CodigoMovimento.INCLUSAO_BLOQUEADO,
          codigo_barras: payable.barcode.replace(/\s/g, ""),
          nome_beneficiario:
            payable?.contract?.supplier?.name ||
            payable?.contract?.collaborator?.name ||
            payable?.supplier?.name ||
            payable?.collaborator?.name,
          data_vencimento,
          valor_titulo: valor_documento,
          data_pagamento,
          valor_pagamento: valor_documento,
          referencia_pagador: payable.identifierCode.padEnd(20, " "),
        };

        const segmentoJ52: SegmentoJ52 = {
          cod_seg_registro_lote: "J52",
          lote: countLotes.toString(),
          num_seq_registro_lote: (seg_lote + 1).toString(),
          cod_seg_registro_lote_default: "J",
          movimento_cod: CodigoMovimento.INCLUSAO_BLOQUEADO,

          tipo_inscricao_sacado: TipoDocumento.CNPJ,
          numero_inscricao_sacado: CONFIG_ABC.empresa_num_insc,
          nome_sacado: CONFIG_ABC.nome_banco,

          tipo_inscricao_cedente: TipoDocumento.CNPJ,
          numero_inscricao_cedente: payable?.supplier.cnpj,
          nome_cedente: payable?.supplier.name,

          tipo_inscricao_sacador: TipoDocumento.CNPJ,
          numero_inscricao_sacador: CONFIG_ABC.empresa_num_insc,
          nome_sacador: CONFIG_ABC.nome_banco,
        };

        return [segmentoJ, segmentoJ52];

      default:
        throw new InvalidPaymentTypeError();
    }
  }

  /*
   * Separa a agência e o dígito verificador da agência
   * Caso a agência não tenha dígito verificador, retorna um array com a agência e uma string vazia
   */
  private splitAgency(agency: string): string[] {
    return agency?.includes("-") ? agency.split("-") : [agency];
  }

  private createSegmentoA(
    segmentoABase: Pick<SegmentoA, KeysBaseSegmentB>,
    additionalData: Omit<SegmentoA, KeysBaseSegmentB>
  ): SegmentoA {
    return {
      ...segmentoABase,
      ...additionalData,
    };
  }

  private createSegmentoB(
    additionalData: Omit<
      SegmentoB,
      "cod_seg_registro_lote" | "num_seq_registro_lote"
    >,
    seg_lote: number
  ): SegmentoB {
    return {
      cod_seg_registro_lote: "B",
      num_seq_registro_lote: (seg_lote + 1).toString(),
      ...additionalData,
    };
  }

  private createSegmentoBPix(
    additionalData: Omit<
      SegmentoBPix,
      "cod_seg_registro_lote" | "num_seq_registro_lote"
    >,
    seg_lote: number
  ): SegmentoBPix {
    return {
      cod_seg_registro_lote: "B",
      num_seq_registro_lote: (seg_lote + 1).toString(),
      ...additionalData,
    };
  }

  /**
   * Mapeia os dados de iniciação do Pix para Telofone, Email, Chave Aleatória ou CPF/CNPJ
   */
  private mapperPixInitiationData(payable: Payables) {
    const { contract, supplier } = payable;
    let pixInfo: PixInfo;
    if (contract) {
      pixInfo = contract.pixInfo;
    } else if (supplier) {
      pixInfo = supplier.pixInfo;
    } else {
      throw new PayablePixNotFoundError();
    }

    const { key, key_type } = pixInfo;
    let forma_de_iniciacao: IdentificacaoFavorecidoChavePix;
    const chave_pix = key;

    switch (key_type) {
      case "CELLPHONE":
        forma_de_iniciacao = IdentificacaoFavorecidoChavePix.TELEFONE;
        return {
          forma_de_iniciacao,
          chave_pix: `+55${chave_pix.replace(/\D/g, "")}`,
        };
      case "EMAIL":
        forma_de_iniciacao = IdentificacaoFavorecidoChavePix.EMAIL;
        return {
          forma_de_iniciacao,
          chave_pix,
        };
      case "ALEATORY_KEY":
        forma_de_iniciacao = IdentificacaoFavorecidoChavePix.ALEATORIA;
        return {
          forma_de_iniciacao,
          chave_pix,
        };
      case "CPF":
      case "CNPJ":
        forma_de_iniciacao = IdentificacaoFavorecidoChavePix.CNPJ_CPF;
        return {
          forma_de_iniciacao,
          chave_pix: chave_pix?.replace(/\D/g, ""),
        };
      default:
        throw new PayablePixNotFoundError();
    }
  }

  /**
   * Pega a parcela atual para pagamento
   * verificando a data de vencimento e status
   */
  private getCurrentInstallment(
    installments: Installments[],
    currentDate: Date
  ): Installments | undefined {
    return installments.find((installment) => {
      const { dueDate, status } = installment;
      if (status !== InstallmentStatus.PENDING) return false;
      return currentDate <= new Date(dueDate);
    });
  }

  /**
   * Retorna a data no formato: DDMMYYYY
   */
  private getFormattedDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  }

  /**
   * Retorna a hora no formato: HHMMSS
   */
  private getFormattedTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}${minutes}${seconds}`;
  }

  /**
   * Pega os dados bancários do favorecido
   * Prioriza os dados do Contrato, depois do Fornecedor
   */
  private getBankData(payable: Payables): Pick<SegmentoA, FavorecidoBankKeys> {
    const { supplier, contract } = payable;

    if (contract) {
      const [favorecido_agencia, favorecido_dig_agencia] = this.splitAgency(
        contract?.bancaryInfo?.agency
      );
      return {
        favorecido_nome:
          contract?.supplier?.name || contract?.collaborator?.name,
        favorecido_cod_banco: contract?.bancaryInfo?.bank?.split(" ")[0] || "",
        favorecido_agencia: addLeadingZeros(favorecido_agencia, 5),
        favorecido_dig_agencia,
        favorecido_num_conta: addLeadingZeros(
          contract?.bancaryInfo?.accountNumber || "",
          12
        ),
        favorecido_dig_verificador: contract?.bancaryInfo?.dv || "",
      };
    } else if (supplier) {
      const [favorecido_agencia, favorecido_dig_agencia] = this.splitAgency(
        supplier.bancaryInfo.agency
      );
      return {
        favorecido_nome: supplier?.name,
        favorecido_cod_banco: supplier?.bancaryInfo?.bank?.split(" ")[0] || "",
        favorecido_agencia: addLeadingZeros(favorecido_agencia, 5),
        favorecido_dig_agencia,
        favorecido_num_conta: addLeadingZeros(
          supplier?.bancaryInfo?.accountNumber || "",
          12
        ),
        favorecido_dig_verificador: supplier?.bancaryInfo?.dv || "",
      };
    } else {
      throw new PayableBankAccountNotFoundError();
    }
  }

  /**
   * Pegar o CPF ou CNPJ do favorecido
   */
  private getDocumentFavorecido(payable: Payables) {
    const { supplier, collaborator } = payable;

    if (collaborator) {
      return {
        favorecido_tipo_insc: TipoDocumento.CPF,
        favorecido_num_insc: collaborator.cpf,
      };
    } else if (supplier) {
      return {
        favorecido_tipo_insc: TipoDocumento.CNPJ,
        favorecido_num_insc: supplier.cnpj,
      };
    } else {
      throw new PayableDocumentFoundError();
    }
  }

  /**
   * converte pra centavos e retorna string sem ponto
   * @param value
   * @returns
   */
  private convertToCents(value: number): string {
    let valueString = (value + "").replace(/[^\d.-]/g, "");
    if (valueString && valueString.includes(".")) {
      valueString = valueString.substring(0, valueString.indexOf(".") + 3);
    }

    const valueRounded = valueString
      ? Math.round(parseFloat(valueString) * 100)
      : 0;

    return valueRounded.toString();
  }
}
