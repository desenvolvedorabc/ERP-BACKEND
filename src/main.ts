import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/exceptions/http-exception-filter";
import { DataSource } from "typeorm";
import { DbConnection } from "./config/typeorm/dbConnection";
import { getCustomExceptionFactory } from "./common/exceptions/customExceptionFactory";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const dbConnection = DbConnection.getInstance();
  await dbConnection.connect(dataSource);

  const config = new DocumentBuilder()
    .setTitle("ERP Financeiro Api")
    .setDescription("The Erp Financeiro API description")
    .setVersion("1.0")

    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/swagger", app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: false,
      validationError: { target: false, value: false },
      exceptionFactory: getCustomExceptionFactory,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({ allowedHeaders: "*", origin: "*" });
  await app.listen(process.env.PORT);
}
bootstrap();
