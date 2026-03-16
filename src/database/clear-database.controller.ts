import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ClearDatabaseService } from "./clear-database.service";
/*
https://docs.nestjs.com/controllers#controllers
*/

@Controller(
  "eYC7JBUM8bhs9uwUFh6onEYLccoqWvo3nrTFT2Uw8hhUTRvu3DiqbfLjvjdHoXJiyYxAcXxX",
)
export class ClearDatabaseController {
  constructor(private readonly databaseService: ClearDatabaseService) {}

  @Post()
  @HttpCode(200)
  async clear(@Body("password") password: string): Promise<void> {
    return await this.databaseService.clear(password);
  }
}
