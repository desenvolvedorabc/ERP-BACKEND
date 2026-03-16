import { Injectable, BadRequestException } from "@nestjs/common";
import * as XLSX from "xlsx";
import { CollaboratorHistoryRepository } from "../repositories/collaborator-history-repository";
import { CollaboratorsRepository } from "../repositories/typeorm/collaborators-repository";
import { CollaboratorHistory } from "../entities/collaborator-history.entity";
import { DisableBy } from "../enum";

interface HistoryRow {
  collaboratorId?: number;
  cpf?: string;
  email?: string;
  changedField: string;
  previousRole?: string;
  newRole?: string;
  previousStartOfContract?: string | Date;
  newStartOfContract?: string | Date;
  previousRemuneration?: number | string;
  newRemuneration?: number | string;
  previousActive?: boolean | string;
  newActive?: boolean | string;
  previousDisableBy?: string;
  newDisableBy?: string;
  createdAt?: string | Date;
}

@Injectable()
export class ImportCollaboratorHistoryService {
  constructor(
    private readonly historyRepository: CollaboratorHistoryRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async importHistory(file: Express.Multer.File): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      const workbook = XLSX.read(file.buffer, {
        type: "buffer",
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows: HistoryRow[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: null,
      });

      if (!rows || rows.length === 0) {
        throw new BadRequestException("Arquivo vazio ou sem dados.");
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
          if (!row.changedField) {
            errors.push(`Linha ${rowNumber}: Campo 'changedField' é obrigatório.`);
            continue;
          }

          let collaboratorId: number | null = null;

          if (row.collaboratorId) {
            collaboratorId = Number(row.collaboratorId);
          } else if (row.cpf) {
            const cpf = String(row.cpf).replace(/\D/g, "");
            const { collaborator } =
              await this.collaboratorsRepository._findCollaboratorByCpf(cpf);
            if (collaborator) {
              collaboratorId = collaborator.id;
            }
          } else if (row.email) {
            const { collaborator } =
              await this.collaboratorsRepository._findCollaboratorByEmail(
                String(row.email),
              );
            if (collaborator) {
              collaboratorId = collaborator.id;
            }
          }

          if (!collaboratorId) {
            errors.push(
              `Linha ${rowNumber}: Colaborador não encontrado. Informe collaboratorId, cpf ou email válido.`,
            );
            continue;
          }

          const historyData: Partial<CollaboratorHistory> = {
            collaboratorId,
            changedField: String(row.changedField).trim(),
          };

          switch (row.changedField.toLowerCase()) {
            case "role":
              historyData.previousRole = row.previousRole
                ? String(row.previousRole)
                : null;
              historyData.newRole = row.newRole ? String(row.newRole) : null;
              break;

            case "startofcontract":
            case "start_of_contract":
            case "admissão":
              historyData.previousStartOfContract = this.parseDate(
                row.previousStartOfContract,
              );
              historyData.newStartOfContract = this.parseDate(
                row.newStartOfContract,
              );
              break;

            case "remuneration":
            case "remuneração":
              historyData.previousRemuneration = this.parseNumber(
                row.previousRemuneration,
              );
              historyData.newRemuneration = this.parseNumber(row.newRemuneration);
              break;

            case "active":
            case "desligamento":
              historyData.previousActive = this.parseBoolean(row.previousActive);
              historyData.newActive = this.parseBoolean(row.newActive);
              historyData.previousDisableBy = this.parseDisableBy(
                row.previousDisableBy,
              );
              historyData.newDisableBy = this.parseDisableBy(row.newDisableBy);
              break;

            case "disableby":
            case "disable_by":
              historyData.previousActive = this.parseBoolean(row.previousActive);
              historyData.newActive = this.parseBoolean(row.newActive);
              historyData.previousDisableBy = this.parseDisableBy(
                row.previousDisableBy,
              );
              historyData.newDisableBy = this.parseDisableBy(row.newDisableBy);
              break;

            default:
              errors.push(
                `Linha ${rowNumber}: Campo 'changedField' inválido: ${row.changedField}. Valores aceitos: role, startOfContract, remuneration, active, disableBy.`,
              );
              continue;
          }

          if (row.createdAt) {
            const customDate = this.parseDate(row.createdAt);
            if (customDate) {
              const history = this.historyRepository
                .getRepository(CollaboratorHistory)
                .create({
                  ...historyData,
                  createdAt: customDate,
                  updatedAt: customDate,
                });
              await this.historyRepository
                .getRepository(CollaboratorHistory)
                .save(history);
            } else {
              await this.historyRepository.createHistory(historyData);
            }
          } else {
            await this.historyRepository.createHistory(historyData);
          }

          imported++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(
            `Linha ${rowNumber}: Erro ao processar - ${errorMessage}`,
          );
        }
      }

      return {
        success: errors.length === 0,
        imported,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        `Erro ao processar arquivo: ${errorMessage}`,
      );
    }
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "number") {
      return XLSX.SSF.parse_date_code(value);
    }
    const dateStr = String(value).trim();
    if (!dateStr || dateStr === "N/A" || dateStr === "null") return null;

    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})/,
      /^(\d{2})\/(\d{2})\/(\d{4})/,
      /^(\d{2})-(\d{2})-(\d{4})/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          return new Date(
            parseInt(match[1]),
            parseInt(match[2]) - 1,
            parseInt(match[3]),
          );
        } else {
          return new Date(
            parseInt(match[3]),
            parseInt(match[2]) - 1,
            parseInt(match[1]),
          );
        }
      }
    }

    // Tentar parse direto
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;

    return null;
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return value;
    const str = String(value)
      .replace(/[^\d.,-]/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }

  private parseBoolean(value: any): boolean | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "boolean") return value;
    const str = String(value).toLowerCase().trim();
    if (str === "true" || str === "1" || str === "sim" || str === "yes")
      return true;
    if (str === "false" || str === "0" || str === "não" || str === "no")
      return false;
    return null;
  }

  private parseDisableBy(value: any): DisableBy | null {
    if (!value) return null;
    const str = String(value).trim().toUpperCase();
    const validValues = Object.values(DisableBy);
    if (validValues.includes(str as DisableBy)) {
      return str as DisableBy;
    }
    return null;
  }
}

