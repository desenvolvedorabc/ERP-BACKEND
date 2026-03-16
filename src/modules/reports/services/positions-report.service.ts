/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { PositionReportsRepository } from "../repositories/position-reports-repository";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { RawData, TransformedDataForPosition } from "../types/positions";
import { NoDataToExportError } from "../errors";
import { FormatAccountsPositionForCSV } from "src/common/mappers/csv/format-accountsPosition-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";

@Injectable()
export class PositionsReportService {
  constructor(
    private readonly positionReportsRepository: PositionReportsRepository,
  ) {}

  async getReceivablesPositionReport(
    params: ReportPositionParamsDTO,
  ): Promise<TransformedDataForPosition> {
    try {
      const data =
        await this.positionReportsRepository.findReceivablesPositionReportData(
          params,
        );

      return this.transformPositionData(data);
    } catch (error) {
      console.error(error);
    }
  }

  async getPayablesPositionReport(
    params: ReportPositionParamsDTO,
  ): Promise<TransformedDataForPosition> {
    try {
      const dataPayables =
        await this.positionReportsRepository.findPayablesPositionReportData(
          params,
        );
      const dataCardMov =
        await this.positionReportsRepository.findCardMovPositionReportData(
          params,
        );

      const data = [...dataPayables, ...dataCardMov];

      return this.transformPositionData(data);
    } catch (error) {
      console.error(error);
    }
  }

  async getPositionReportCSV(params: ReportPositionParamsDTO, type: "r" | "p") {
    try {
      let data: RawData[];
      if (type === "p") {
        const dataPayables =
          await this.positionReportsRepository.findPayablesPositionReportData(
            params,
          );
        const dataCardMov =
          await this.positionReportsRepository.findCardMovPositionReportData(
            params,
          );
        data = [...dataPayables, ...dataCardMov];
      } else {
        data =
          await this.positionReportsRepository.findReceivablesPositionReportData(
            params,
          );
      }

      const bankReconData =
        await this.positionReportsRepository.findPositionDataForBankRecon(
          params,
        );

      data = [...data, ...bankReconData];

      if (!data?.length) {
        throw new NoDataToExportError();
      }

      const formmatedData = FormatAccountsPositionForCSV(data);

      const { csvData } = generateCsv(formmatedData);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  private transformPositionData(
    rawData: Array<RawData>,
  ): TransformedDataForPosition {
    const groupedData: TransformedDataForPosition = {
      totalPendente: 0,
      totalPago: 0,
      totalAtrasado: 0,
      itens: [],
    };
    const uncategorized = "Não categorizado";

    for (const curr of rawData) {
      const clientKey = curr.id;

      let client = groupedData.itens.find((c) => c.id === clientKey);
      if (!client) {
        client = {
          id: curr.id,
          name: curr.name,
          totalPendente: 0,
          totalPago: 0,
          totalAtrasado: 0,
          costCenter: [],
        };
        groupedData.itens.push(client);
      }

      client.totalPendente += curr.PENDENTE;
      client.totalPago += curr.PAGO;
      client.totalAtrasado += curr.ATRASADO;

      groupedData.totalPendente += curr.PENDENTE;
      groupedData.totalPago += curr.PAGO;
      groupedData.totalAtrasado += curr.ATRASADO;

      let costCenter = client.costCenter.find(
        (c) => c.id === (curr.CostCenter_id ?? uncategorized),
      );
      if (!costCenter) {
        costCenter = {
          id: curr.CostCenter_id ?? uncategorized,
          name: curr.CostCenter_name ?? uncategorized,
          totalAtrasado: 0,
          totalPago: 0,
          totalPendente: 0,
          category: [],
        };
        client.costCenter.push(costCenter);
      }

      costCenter.totalPendente += curr.PENDENTE;
      costCenter.totalPago += curr.PAGO;
      costCenter.totalAtrasado += curr.ATRASADO;

      costCenter.category.push({
        id: curr.Category_id ?? uncategorized,
        name: curr.Category_name ?? uncategorized,
        totalPendente: curr.PENDENTE,
        totalPago: curr.PAGO,
        totalAtrasado: curr.ATRASADO,
      });
    }

    return groupedData;
  }
}
