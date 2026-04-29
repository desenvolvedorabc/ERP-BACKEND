import { Injectable, BadRequestException } from "@nestjs/common";
import { CollaboratorsRepository } from "../repositories/typeorm/collaborators-repository";
import {
  OccupationArea,
  EmploymentRelationship,
  RegistrationStatus,
  GenderIdentity,
  Race,
  FoodCategory,
  Education,
  DisableBy,
} from "../enum";
import { CollaboratorHistoryRepository } from "../repositories/collaborator-history-repository";
import { CollaboratorHistory } from "../entities/collaborator-history.entity";
import { Collaborator } from "../entities/collaborator.entity";
import { CollaboratorHistoryService } from "./collaborator-history.service";

interface CollaboratorCsvRow {
  nome?: string;
  nome_contato_emergencia?: string;
  email?: string;
  telefone?: string;
  telefone_contato_emergencia?: string;
  cpf?: string;
  rg?: string;
  status_cadastro?: string;
  ativo?: string;
  desativador_por?: string;
  programa?: string;
  funcao?: string;
  inicio_contrato?: string;
  data_nascimento?: string;
  endereco_completo?: string;
  vinculo_empregaticio?: string;
  identidade_de_genero?: string;
  raca_cor?: string;
  alergias?: string;
  categoria_alimentar?: string;
  descricao_categoria_alimentar?: string;
  escolaridade?: string;
  experiencia_setor_publico?: string;
  biografia?: string;
  remuneracao?: string;
  historico?: string;
}

// Mapeamento de nomes de colunas para mensagens de erro amigáveis
const FIELD_NAMES: Record<keyof CollaboratorCsvRow, string> = {
  nome: "nome",
  nome_contato_emergencia: "nome_contato_emergencia",
  email: "email",
  telefone: "telefone",
  telefone_contato_emergencia: "telefone_contato_emergencia",
  cpf: "cpf",
  rg: "rg",
  status_cadastro: "status_cadastro",
  ativo: "ativo",
  desativador_por: "desativador_por",
  programa: "programa",
  funcao: "funcao",
  inicio_contrato: "inicio_contrato",
  data_nascimento: "data_nascimento",
  endereco_completo: "endereco_completo",
  vinculo_empregaticio: "vinculo_empregaticio",
  identidade_de_genero: "identidade_de_genero",
  raca_cor: "raca_cor",
  alergias: "alergias",
  categoria_alimentar: "categoria_alimentar",
  descricao_categoria_alimentar: "descricao_categoria_alimentar",
  escolaridade: "escolaridade",
  experiencia_setor_publico: "experiencia_setor_publico",
  biografia: "biografia",
  remuneracao: "remuneracao",
  historico: "historico",
};

@Injectable()
export class ImportCollaboratorsService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly historyRepository: CollaboratorHistoryRepository,
    private readonly historyService: CollaboratorHistoryService,
  ) {}

  async importCollaborators(file: Express.Multer.File): Promise<{
    success: boolean;
    imported: number;
    message?: string;
    isPartialImport?: boolean;
    errors: Array<{
      line: number;
      message: string;
      rowData: CollaboratorCsvRow;
    }>;
  }> {
    const errors: Array<{
      line: number;
      message: string;
      rowData: CollaboratorCsvRow;
    }> = [];
    let imported = 0;

    const lowerName = file.originalname.toLowerCase();
    const isCsv = lowerName.endsWith(".csv");

    if (!isCsv) {
      throw new BadRequestException(
        "Formato inválido. Apenas arquivos CSV são aceitos.",
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException("Arquivo vazio ou inválido.");
    }

    try {
      let csvString = file.buffer.toString("utf-8");

      // Remove BOM if present
      if (csvString.charCodeAt(0) === 0xFEFF) {
        csvString = csvString.substring(1);
      }

      const rows: CollaboratorCsvRow[] = this.parseCsv(csvString);

      if (!rows || rows.length === 0) {
        throw new BadRequestException("Arquivo vazio ou sem dados.");
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const lineNumber = i + 2;

        try {
          const validationResult = this.validateRow(row);
          if (!validationResult.valid) {
            errors.push({
              line: lineNumber,
              message: validationResult.error,
              rowData: { ...row },
            });
            continue;
          }

          const cpf = this.cleanCpf(row.cpf);
          const email = row.email.trim().toLowerCase();
          const rg = row.rg.trim();

          const existingByCpf =
            await this.collaboratorsRepository._findCollaboratorByCpf(cpf);
          const existingByEmail =
            await this.collaboratorsRepository._findCollaboratorByEmail(email);
          const existingByRg = await this.findCollaboratorByRg(rg);

          if (existingByCpf.collaborator) {
            errors.push({
              line: lineNumber,
              message: `Colaborador já existe com este CPF: ${cpf}`,
              rowData: { ...row },
            });
            continue;
          }

          if (existingByEmail.collaborator) {
            errors.push({
              line: lineNumber,
              message: `Colaborador já existe com este email: ${email}`,
              rowData: { ...row },
            });
            continue;
          }

          if (existingByRg) {
            errors.push({
              line: lineNumber,
              message: `Colaborador já existe com este RG: ${rg}`,
              rowData: { ...row },
            });
            continue;
          }

          await this.createCollaboratorFromCsv(row, validationResult.data);
          imported++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push({
            line: lineNumber,
            message: errorMessage,
            rowData: { ...row },
          });
        }
      }

      let message: string | undefined;
      let isPartialImport = false;
      
      if (imported > 0 && errors.length > 0) {
        message = "IMPORTAÇÃO PARCIALMENTE REALIZADA. VERIFIQUE OS DADOS INCONSISTENTES";
        isPartialImport = true;
      } else if (imported > 0 && errors.length === 0) {
        message = "Importação realizada com sucesso";
      }

      return {
        success: imported > 0,
        imported,
        message,
        isPartialImport,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        `Erro ao processar arquivo: ${errorMessage}`,
      );
    }
  }

  private validateRow(
    row: CollaboratorCsvRow,
  ): {
    valid: boolean;
    error?: string;
    data?: any;
  } {
    const requiredFields: Array<keyof CollaboratorCsvRow> = [
      "nome",
      "nome_contato_emergencia",
      "email",
      "telefone",
      "telefone_contato_emergencia",
      "cpf",
      "rg",
      "status_cadastro",
      "ativo",
      "programa",
      "funcao",
      "inicio_contrato",
      "data_nascimento",
      "endereco_completo",
      "vinculo_empregaticio",
      "identidade_de_genero",
      "raca_cor",
      "alergias",
      "categoria_alimentar",
      "escolaridade",
      "experiencia_setor_publico",
      "biografia",
      "remuneracao",
      "historico",
    ];

    const missing: string[] = [];
    const invalid: string[] = [];

    for (const field of requiredFields) {
      const value = (row as any)[field];
      const isEmpty =
        value === null ||
        value === undefined ||
        String(value).trim() === "" ||
        String(value).trim().toUpperCase() === "N/A";

      if (isEmpty) {
        missing.push(FIELD_NAMES[field]);
      }
    }

    // Validação de status_cadastro - primeiro valida se é enum válido, depois se é CADASTRO_COMPLETO
    if (row.status_cadastro) {
      if (!this.isValidEnum(RegistrationStatus, row.status_cadastro)) {
        invalid.push(
          `status_cadastro inválido. Valores aceitos: ${Object.values(RegistrationStatus).join(", ")}`,
        );
      } else if (
        row.status_cadastro.trim().toUpperCase() !==
        RegistrationStatus.CADASTRO_COMPLETO
      ) {
        invalid.push(
          `status_cadastro deve ser '${RegistrationStatus.CADASTRO_COMPLETO}'`,
        );
      }
    }

    const active = this.parseBoolean(row.ativo);
    if (row.ativo && active === null) {
      invalid.push("Campo 'ativo' inválido. Use 'Sim' ou 'Não'.");
    }

    // Validação de desativador_por - só valida se ativo for válido
    if (active !== null) {
      if (!active) {
        if (
          !row.desativador_por ||
          row.desativador_por.trim() === "" ||
          row.desativador_por.trim().toUpperCase() === "N/A"
        ) {
          missing.push("desativador_por");
        }
      } else {
        if (
          row.desativador_por &&
          row.desativador_por.trim().toUpperCase() !== "N/A"
        ) {
          invalid.push(
            "Campo 'desativador_por' deve ser 'N/A' quando 'ativo' é 'Sim'.",
          );
        }
      }
    }

    if (
      row.categoria_alimentar === FoodCategory.OUTRO &&
      (!row.descricao_categoria_alimentar ||
        row.descricao_categoria_alimentar.trim() === "" ||
        row.descricao_categoria_alimentar.trim().toUpperCase() === "N/A")
    ) {
      missing.push("descricao_categoria_alimentar");
    }

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Campos obrigatórios ausentes ou com valor 'N/A': ${missing.join(", ")}`,
      };
    }

    // Validações de formato e valores específicos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (row.email && !emailRegex.test(row.email.trim())) {
      invalid.push("Email inválido. Deve conter '@' e um domínio válido.");
    }

    // Validação de telefone - verifica antes de limpar
    let telefone = "";
    if (row.telefone) {
      const telefoneOriginal = String(row.telefone).trim();
      // Verifica se contém letras
      if (/[a-zA-Z]/.test(telefoneOriginal)) {
        invalid.push("Telefone inválido. Não pode conter letras.");
      }
      // Verifica se contém espaços
      if (/\s/.test(telefoneOriginal)) {
        invalid.push("Telefone inválido. Não pode conter espaços.");
      }
      // Limpa e valida
      telefone = this.cleanPhone(row.telefone);
      if (telefone && !/^\d+$/.test(telefone)) {
        invalid.push("Telefone inválido. Deve conter apenas números.");
      } else if (telefone && telefone.length < 8) {
        invalid.push("Telefone inválido. Deve conter no mínimo 8 dígitos.");
      }
    }

    // Validação de telefone de emergência - verifica antes de limpar
    let telefoneEmergencia = "";
    if (row.telefone_contato_emergencia) {
      const telefoneEmergenciaOriginal = String(row.telefone_contato_emergencia).trim();
      // Verifica se contém letras
      if (/[a-zA-Z]/.test(telefoneEmergenciaOriginal)) {
        invalid.push("Telefone de contato de emergência inválido. Não pode conter letras.");
      }
      // Verifica se contém espaços
      if (/\s/.test(telefoneEmergenciaOriginal)) {
        invalid.push("Telefone de contato de emergência inválido. Não pode conter espaços.");
      }
      // Limpa e valida
      telefoneEmergencia = this.cleanPhone(row.telefone_contato_emergencia);
      if (telefoneEmergencia && !/^\d+$/.test(telefoneEmergencia)) {
        invalid.push("Telefone de contato de emergência inválido. Deve conter apenas números.");
      } else if (telefoneEmergencia && telefoneEmergencia.length < 8) {
        invalid.push("Telefone de contato de emergência inválido. Deve conter no mínimo 8 dígitos.");
      }
    }

    // Validação de CPF - formato e dígitos verificadores
    const cpf = this.cleanCpf(row.cpf);
    if (row.cpf) {
      if (cpf.length !== 11) {
        invalid.push("CPF inválido. Deve conter exatamente 11 dígitos numéricos.");
      } else if (!this.isValidCpf(cpf)) {
        invalid.push("CPF inválido. Formato ou dígitos verificadores incorretos.");
      }
    }

    if (row.rg) {
      const rgLimpo = row.rg.trim().replace(/[.\-]/g, "");
      if (rgLimpo.length < 4) {
        invalid.push("RG inválido. Deve conter no mínimo 4 caracteres.");
      }
    }

    // Validações de enums - acumula erros
    if (row.programa && !this.isValidEnum(OccupationArea, row.programa)) {
      invalid.push(
        `Programa inválido. Valores aceitos: ${Object.values(OccupationArea).join(", ")}`,
      );
    }

    if (
      row.vinculo_empregaticio &&
      !this.isValidEnum(EmploymentRelationship, row.vinculo_empregaticio)
    ) {
      invalid.push(
        `Vínculo empregatício inválido. Valores aceitos: ${Object.values(EmploymentRelationship).join(", ")}`,
      );
    }

    if (
      row.identidade_de_genero &&
      !this.isValidEnum(GenderIdentity, row.identidade_de_genero)
    ) {
      invalid.push(
        `Identidade de gênero inválida. Valores aceitos: ${Object.values(GenderIdentity).join(", ")}`,
      );
    }

    if (row.raca_cor && !this.isValidEnum(Race, row.raca_cor)) {
      invalid.push(
        `Raça/Cor inválida. Valores aceitos: ${Object.values(Race).join(", ")}`,
      );
    }

    if (
      row.categoria_alimentar &&
      !this.isValidEnum(FoodCategory, row.categoria_alimentar)
    ) {
      invalid.push(
        `Categoria alimentar inválida. Valores aceitos: ${Object.values(FoodCategory).join(", ")}`,
      );
    }

    if (row.escolaridade && !this.isValidEnum(Education, row.escolaridade)) {
      invalid.push(
        `Escolaridade inválida. Valores aceitos: ${Object.values(Education).join(", ")}`,
      );
    }

    // Validações de datas - acumula erros
    const startOfContract = this.parseDate(row.inicio_contrato);
    if (row.inicio_contrato) {
      if (!startOfContract) {
        invalid.push("Data de início de contrato inválida.");
      }
    }

    const dateOfBirth = this.parseDate(row.data_nascimento);
    if (row.data_nascimento) {
      if (!dateOfBirth) {
        invalid.push("Data de nascimento inválida.");
      }
    }

    // Validação de experiência no setor público - acumula erros
    const experienceInPublicSector = this.parseBoolean(
      row.experiencia_setor_publico,
    );
    if (
      row.experiencia_setor_publico &&
      experienceInPublicSector === null
    ) {
      invalid.push(
        "Experiência no setor público inválida. Use 'Sim' ou 'Não'.",
      );
    }

    // Validação de motivo de desligamento - acumula erros
    let disableBy: DisableBy | null = null;
    if (active !== null && !active) {
      if (row.desativador_por && !this.isValidEnum(DisableBy, row.desativador_por)) {
        invalid.push(
          `Motivo de desligamento inválido. Valores aceitos: ${Object.values(DisableBy).join(", ")}`,
        );
      } else if (row.desativador_por) {
        disableBy = row.desativador_por as DisableBy;
      }
    }

    // Validação de remuneração - acumula erros
    const remuneration = this.parseNumber(row.remuneracao);
    if (row.remuneracao && remuneration === null) {
      invalid.push("Campo 'remuneracao' inválido.");
    }

    // Retorna todos os erros acumulados
    if (missing.length > 0 || invalid.length > 0) {
      const errorMessages: string[] = [];
      if (missing.length > 0) {
        errorMessages.push(
          `Campos obrigatórios ausentes ou com valor 'N/A': ${missing.join(", ")}`,
        );
      }
      if (invalid.length > 0) {
        errorMessages.push(invalid.join("; "));
      }
      return {
        valid: false,
        error: errorMessages.join("; "),
      };
    }

    // Garantir que telefones estejam limpos para uso nos dados
    const telefoneFinal = telefone || this.cleanPhone(row.telefone || "");
    const telefoneEmergenciaFinal = telefoneEmergencia || this.cleanPhone(row.telefone_contato_emergencia || "");

    const data: any = {
      name: row.nome.trim(),
      email: row.email.trim().toLowerCase(),
      cpf: cpf,
      occupationArea: row.programa as OccupationArea,
      role: row.funcao.trim(),
      startOfContract: startOfContract,
      employmentRelationship: row.vinculo_empregaticio as EmploymentRelationship,
      rg: row.rg.trim(),
      completeAddress: row.endereco_completo.trim(),
      dateOfBirth: dateOfBirth,
      telephone: telefoneFinal,
      emergencyContactName: row.nome_contato_emergencia.trim(),
      emergencyContactTelephone: telefoneEmergenciaFinal,
      genderIdentity: row.identidade_de_genero as GenderIdentity,
      race: row.raca_cor as Race,
      allergies: row.alergias.trim(),
      foodCategory: row.categoria_alimentar as FoodCategory,
      foodCategoryDescription: row.descricao_categoria_alimentar?.trim() || null,
      education: row.escolaridade as Education,
      experienceInThePublicSector: experienceInPublicSector,
      biography: row.biografia.trim(),
      status: RegistrationStatus.CADASTRO_COMPLETO,
      active,
      disableBy: disableBy || null,
      remuneration,
      historico: row.historico?.trim() || "",
    };

    return {
      valid: true,
      data,
    };
  }

  private async createCollaboratorFromCsv(
    row: CollaboratorCsvRow,
    data: any,
  ): Promise<void> {
    const collaboratorData = {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      occupationArea: data.occupationArea,
      role: data.role,
      startOfContract: data.startOfContract,
      employmentRelationship: data.employmentRelationship,
      rg: data.rg,
      completeAddress: data.completeAddress,
      dateOfBirth: data.dateOfBirth,
      telephone: data.telephone,
      emergencyContactName: data.emergencyContactName,
      emergencyContactTelephone: data.emergencyContactTelephone,
      genderIdentity: data.genderIdentity,
      race: data.race,
      allergies: data.allergies,
      foodCategory: data.foodCategory,
      foodCategoryDescription: data.foodCategoryDescription,
      education: data.education,
      experienceInThePublicSector: data.experienceInThePublicSector,
      biography: data.biography,
      active: data.active,
      disableBy: data.disableBy,
      status: RegistrationStatus.CADASTRO_COMPLETO,
    };

    const collaborator = this.collaboratorsRepository.getRepository(Collaborator).create(collaboratorData);
    const savedCollaborator = await this.collaboratorsRepository.getRepository(Collaborator).save(collaborator);

    await this.historyService.recordInitialSnapshot(savedCollaborator.id, data);

    if (data.historico && data.historico.trim() !== "") {
      await this.persistRemunerationAndHistory(savedCollaborator.id, null, data.historico);
    }
  }


  private parseCsv(csvString: string): CollaboratorCsvRow[] {
    const lines = csvString.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Auto-detect delimiter: check if header has more semicolons or commas
    const firstLine = lines[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semicolonCount >= commaCount ? ";" : ",";

    const headers = this.parseCsvLine(lines[0], delimiter).map((h) =>
      h.trim().toLowerCase(),
    );
    const rows: CollaboratorCsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = this.parseCsvLine(lines[i], delimiter);
      const row: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        const val = values[j] !== undefined ? values[j].trim() : null;
        row[headers[j]] = val === "" ? null : val;
      }
      rows.push(row as CollaboratorCsvRow);
    }

    return rows;
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current);

    return result;
  }

  private cleanCpf(cpf: string): string {
    if (!cpf) return "";
    return cpf.replace(/\D/g, "");
  }

  private cleanPhone(phone: string): string {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      // Valida se a data é válida
      if (isNaN(value.getTime())) return null;
      // Cria uma nova data com apenas a parte de data (sem hora) para evitar problemas de timezone
      const year = value.getFullYear();
      const month = value.getMonth();
      const day = value.getDate();
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    
    let dateStr = String(value).trim();
    if (!dateStr || dateStr === "N/A" || dateStr === "null") return null;
    
    // Remove espaços extras
    dateStr = dateStr.replace(/\s+/g, "");

    // Normaliza a string para garantir que zeros à esquerda sejam preservados
    // Se a data vier como número do Excel (ex: 36526), tenta converter
    if (!isNaN(Number(dateStr)) && !dateStr.includes("/") && !dateStr.includes("-")) {
      // Pode ser um número serial do Excel, mas vamos tratar como string primeiro
      // Se for um número muito grande, pode ser timestamp
      const numValue = Number(dateStr);
      if (numValue > 1000000) {
        // Provavelmente é timestamp
        const date = new Date(numValue);
        if (!isNaN(date.getTime())) return date;
      }
      // Se for número pequeno, pode ser serial do Excel, mas vamos rejeitar
      return null;
    }

    // Normaliza formatos com barras ou hífens
    // Garante que dias e meses tenham 2 dígitos quando necessário
    const separator = dateStr.includes("/") ? "/" : (dateStr.includes("-") ? "-" : null);
    if (separator) {
      const parts = dateStr.split(separator);
      if (parts.length === 3) {
        // Identifica se é formato YYYY-MM-DD (ano primeiro) ou DD/MM/YYYY (ano último)
        const isYearFirst = parts[0].trim().length === 4 || 
                           (parseInt(parts[0].trim(), 10) >= 1900 && parseInt(parts[0].trim(), 10) <= 2100);
        
        // Normaliza cada parte
        const normalizedParts = parts.map((part, index) => {
          const trimmedPart = part.trim();
          const num = parseInt(trimmedPart, 10);
          if (isNaN(num)) return trimmedPart;
          
          // Determina se esta parte é o ano
          const isYear = isYearFirst ? (index === 0) : (index === 2);
          
          if (isYear) {
            // Se for ano de 2 dígitos (00-99), mantém como está (será convertido depois)
            if (trimmedPart.length === 2 && num >= 0 && num <= 99) {
              return trimmedPart;
            }
            // Se for ano de 4 dígitos, mantém como está
            if (num >= 1900 && num <= 2100) {
              return String(num).padStart(4, "0");
            }
          } else {
            // Se for dia ou mês, garante 2 dígitos (preserva zeros à esquerda)
            if (num >= 1 && num <= 31) {
              return String(num).padStart(2, "0");
            }
          }
          return trimmedPart;
        });
        
        // Reconstrói a string normalizada
        dateStr = normalizedParts.join(separator);
      }
    }

    // Rejeita datas incompletas (sem ano)
    // Aceita formatos como DD/MM/YYYY, D/M/YYYY, DD/MM/YY, D/M/YY
    if (dateStr.length < 5) return null;

    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,  // D/M/YY, D/M/YYYY, DD/MM/YY, DD/MM/YYYY
      /^(\d{2,4})-(\d{1,2})-(\d{1,2})$/,  // YY-MM-DD, YYYY-MM-DD, YY-M-DD, YYYY-M-DD
      /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/,  // D-M-YY, D-M-YYYY, DD-MM-YY, DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year: number, month: number, day: number;
        
        if (format === formats[0]) {
          // DD/MM/YYYY ou D/M/YYYY ou DD/MM/YY ou D/M/YY
          day = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          let yearStr = match[3];
          // Converte ano de 2 dígitos para 4 dígitos (00-99 = 2000-2099)
          if (yearStr.length === 2) {
            const year2Digits = parseInt(yearStr, 10);
            year = year2Digits >= 0 && year2Digits <= 99 ? 2000 + year2Digits : null;
            if (year === null) return null;
          } else {
            year = parseInt(yearStr, 10);
          }
        } else if (format === formats[1]) {
          // YYYY-MM-DD ou YY-MM-DD
          let yearStr = match[1];
          if (yearStr.length === 2) {
            const year2Digits = parseInt(yearStr, 10);
            year = year2Digits >= 0 && year2Digits <= 99 ? 2000 + year2Digits : null;
            if (year === null) return null;
          } else {
            year = parseInt(yearStr, 10);
          }
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else {
          // DD-MM-YYYY ou D-M-YYYY ou DD-MM-YY ou D-M-YY
          day = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          let yearStr = match[3];
          if (yearStr.length === 2) {
            const year2Digits = parseInt(yearStr, 10);
            year = year2Digits >= 0 && year2Digits <= 99 ? 2000 + year2Digits : null;
            if (year === null) return null;
          } else {
            year = parseInt(yearStr, 10);
          }
        }

        // Valida os valores
        if (month < 0 || month > 11) return null;
        if (day < 1 || day > 31) return null;
        if (year < 1900 || year > 2100) return null;

        // Cria a data (meia-noite no timezone local)
        const date = new Date(year, month, day, 0, 0, 0, 0);
        
        // Verifica se não é Invalid Date
        if (isNaN(date.getTime())) return null;
        
        // Verifica se a data criada corresponde aos valores informados
        // Usa getFullYear, getMonth, getDate para validar (considera timezone local)
        const createdYear = date.getFullYear();
        const createdMonth = date.getMonth();
        const createdDay = date.getDate();
        
        // Valida se a data criada corresponde exatamente aos valores informados
        // Isso garante que datas inválidas como 31/02 sejam rejeitadas
        if (createdYear === year && createdMonth === month && createdDay === day) {
          return date;
        }

        // Se não correspondeu, a data é inválida (ex: 31/02)
        return null;
      }
    }

    // Se não correspondeu a nenhum formato, retorna null
    return null;
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

  private parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    
    let cleaned = String(value)
      .replace(/[R$]/gi, "") // Remove R$ e $
      .replace(/\s/g, "") // Remove espaços
      .trim();

    if (cleaned.includes(".") && cleaned.includes(",")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",") && !cleaned.includes(".")) {
      cleaned = cleaned.replace(",", ".");
    }
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  private async findCollaboratorByRg(rg: string): Promise<Collaborator | null> {
    const collaborator = await this.collaboratorsRepository
      .getRepository(Collaborator)
      .findOne({
        where: {
          rg,
        },
      });
    return collaborator;
  }

  private isValidEnum(enumObject: any, value: string): boolean {
    return Object.values(enumObject).includes(value);
  }

  private isValidCpf(cpf: string): boolean {
    if (!cpf || cpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  }

  private async persistRemunerationAndHistory(
    collaboratorId: number,
    remuneration: number,
    historicoText?: string,
  ): Promise<void> {
    const records: Partial<CollaboratorHistory>[] = [];

    if (remuneration !== undefined && remuneration !== null) {
      records.push({
        collaboratorId,
        changedField: "remuneration",
        newRemuneration: remuneration,
      });
    }

    if (historicoText && historicoText.trim() !== "") {
      const parts = historicoText
        .split(/[{;}]/)
        .map((p) => p.trim())
        .filter(Boolean);
      const entries = parts.length ? parts : [historicoText.trim()];

      for (const part of entries) {
        records.push({
          collaboratorId,
          changedField: "history_text",
          newRole: part,
        });
      }
    }

    for (const record of records) {
      await this.historyRepository.createHistory(record);
    }
  }
}

