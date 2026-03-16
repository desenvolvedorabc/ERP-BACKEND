import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

interface ImportExcelErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error: string;
  details?: any;
  logDownloadUrl?: string;
  stack?: string;
  context?: {
    fileName?: string;
    tipoPlanilha?: string;
    tabs?: string[];
    fileSize?: number;
    fileType?: string;
  };
}

@Catch()
export class ImportExcelExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ImportExcelExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const context = this.extractContext(request);

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const error = this.getErrorType(exception);

    this.logDetailedError(exception, request, context);

    const responseBody: ImportExcelErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: error,
      context: context,
    };

    if (process.env?.NODE_ENV === "development") {
      responseBody.stack = exception.stack;
    }

    if (exception.details) {
      responseBody.details = exception.details;
    }

    if (exception.logDownloadUrl) {
      responseBody.logDownloadUrl = exception.logDownloadUrl;
    }

    if (this.isDatabaseError(exception)) {
      responseBody.details = {
        type: "database_error",
        code: exception.code,
        constraint: exception.constraint,
        table: exception.table,
        column: exception.column,
        suggestion: this.getDatabaseErrorSuggestion(exception),
      };
    }

    if (this.isFileValidationError(exception)) {
      responseBody.details = {
        type: "file_validation_error",
        fileName: context.fileName,
        fileSize: context.fileSize,
        fileType: context.fileType,
        suggestion: this.getFileValidationSuggestion(exception),
      };
    }

    if (context.tipoPlanilha === "TIPO2") {
      responseBody.details = {
        ...responseBody.details,
        tipoPlanilha: "TIPO2",
        commonIssues: [
          "Verifique se o arquivo TIPO1 foi importado primeiro",
          "Confirme se as estruturas de programa e budget plan existem",
          "Valide se as abas específicas do TIPO2 estão presentes",
          "Verifique se os dados estão no formato esperado",
        ],
        troubleshooting: [
          "Execute uma importação TIPO1 primeiro para criar as estruturas base",
          'Verifique se o programa com abreviação "PRT2" existe no banco',
          "Confirme se o plano orçamentário para o ano atual foi criado",
          "Valide se os municípios e estados parceiros estão configurados",
        ],
      };
    }

    response.status(status).json(responseBody);
  }

  private extractContext(request: Request) {
    const context: any = {};

    if (request.file) {
      context.fileName = request.file.originalname;
      context.fileSize = request.file.size;
      context.fileType = request.file.mimetype;
    }

    if (request.body) {
      context.tipoPlanilha = request.body.tipoPlanilha;
      context.tabs = request.body.tabs;
    }

    return context;
  }

  private getStatus(exception: any): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (this.isDatabaseError(exception)) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    if (this.isFileValidationError(exception)) {
      return HttpStatus.BAD_REQUEST;
    }

    if (this.isBusinessLogicError(exception)) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: any): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
      return response?.message || exception.message;
    }

    if (this.isDatabaseError(exception)) {
      return "Erro no banco de dados durante a importação";
    }

    if (this.isFileValidationError(exception)) {
      return "Erro na validação do arquivo enviado";
    }

    if (this.isBusinessLogicError(exception)) {
      return "Erro na lógica de negócio da importação";
    }

    return exception.message || "Erro interno durante a importação";
  }

  private getErrorType(exception: any): string {
    if (exception instanceof HttpException) {
      return "HTTP_EXCEPTION";
    }

    if (this.isDatabaseError(exception)) {
      return "DATABASE_ERROR";
    }

    if (this.isFileValidationError(exception)) {
      return "FILE_VALIDATION_ERROR";
    }

    if (this.isBusinessLogicError(exception)) {
      return "BUSINESS_LOGIC_ERROR";
    }

    return "UNKNOWN_ERROR";
  }

  private isDatabaseError(exception: any): boolean {
    return (
      exception.code &&
      (exception.code.startsWith("ER_") ||
        exception.code.startsWith("SQLSTATE_") ||
        exception.code === "23505" ||
        exception.code === "23503" ||
        exception.code === "23514")
    );
  }

  private isFileValidationError(exception: any): boolean {
    return (
      exception.message &&
      (exception.message.includes("arquivo") ||
        exception.message.includes("file") ||
        exception.message.includes("Excel") ||
        exception.message.includes("formato"))
    );
  }

  private isBusinessLogicError(exception: any): boolean {
    return (
      exception.message &&
      (exception.message.includes("não encontrado") ||
        exception.message.includes("não existe") ||
        exception.message.includes("Execute uma importação TIPO1 primeiro") ||
        exception.message.includes("estruturas base"))
    );
  }

  private getDatabaseErrorSuggestion(exception: any): string {
    if (exception.code === "ER_DATA_TOO_LONG") {
      return "Verifique se algum campo excede o tamanho máximo permitido";
    }

    if (exception.code === "ER_OUT_OF_RANGE_VALUE") {
      return "Verifique se os valores numéricos estão dentro dos limites permitidos";
    }

    if (exception.code === "ER_DUP_ENTRY") {
      return "Tentativa de inserir registro duplicado. Verifique se os dados já existem";
    }

    if (exception.code === "ER_NO_REFERENCED_ROW_2") {
      return "Referência inválida. Verifique se as estruturas base foram criadas corretamente";
    }

    return "Verifique os dados e a estrutura do banco de dados";
  }

  private getFileValidationSuggestion(exception: any): string {
    if (exception.message.includes("vazio")) {
      return "Verifique se o arquivo não está corrompido e contém dados válidos";
    }

    if (exception.message.includes("formato")) {
      return "Use apenas arquivos Excel (.xlsx, .xls) ou CSV válidos";
    }

    if (exception.message.includes("tamanho")) {
      return "O arquivo deve ter no máximo 10MB";
    }

    return "Verifique o formato e conteúdo do arquivo enviado";
  }

  private logDetailedError(exception: any, request: Request, context: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception.message || "Erro desconhecido",
      stack: exception.stack,
      context: context,
      userAgent: request.headers["user-agent"],
      ip: request.ip || request.connection.remoteAddress,
    };

    this.logger.error(
      "Erro detalhado na importação de Excel:",
      JSON.stringify(errorLog, null, 2),
    );

    this.saveErrorLog(errorLog);
  }

  private saveErrorLog(errorLog: any) {
    try {
      const logsDir = path.join(process.cwd(), "logs", "import-excel-errors");
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const logFileName = `error-${timestamp}.log`;
      const logFilePath = path.join(logsDir, logFileName);

      const logContent = JSON.stringify(errorLog, null, 2);
      fs.writeFileSync(logFilePath, logContent, "utf8");

      this.logger.log(`Log de erro salvo em: ${logFilePath}`);
    } catch (saveError) {
      this.logger.error("Erro ao salvar log de erro:", saveError);
    }
  }
}
