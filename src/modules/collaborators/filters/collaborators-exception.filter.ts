import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class CollaboratorsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message || "Erro interno do servidor";

    if (exception.code === "LIMIT_FILE_SIZE" || 
        exception.message?.includes("File too large") ||
        exception.message?.includes("too large") ||
        exception.message?.includes("Too many") ||
        exception.message?.toLowerCase().includes("file size")) {
      status = HttpStatus.BAD_REQUEST;
      message = "Arquivo muito grande. O tamanho máximo permitido é 10MB.";
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && (exceptionResponse as any).message) {
        const msg = (exceptionResponse as any).message;
        if (Array.isArray(msg)) {
          message = msg.join(", ");
        } else {
          message = msg;
        }

        if (typeof message === "string" && 
            (message.includes("File too large") ||
             message.includes("too large") ||
             message.includes("Too many") ||
             message.toLowerCase().includes("file size") ||
             message.toLowerCase().includes("limit_file_size"))) {
          message = "Arquivo muito grande. O tamanho máximo permitido é 10MB.";
        }
      }
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    };

    if (process.env?.NODE_ENV === "development") {
      responseBody["stack"] = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
