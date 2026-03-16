import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
type ResponseBody = {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  stack?: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { message } = exception.getResponse() as any;

    const responseBody: ResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message ?? exception.message,
    };
    if (process.env?.NODE_ENV === "development") {
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
