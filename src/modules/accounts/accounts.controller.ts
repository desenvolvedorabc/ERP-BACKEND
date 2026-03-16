import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AccountsService } from "./services/accounts.service";
import { CreateAccountDTO } from "./dtos/createAccount.dto";
import { Accounts } from "./entities/accounts.entity";
import { UpdateAccountDTO } from "./dtos/updateAccount.dto";
import { AccountsPaginateParams } from "./dtos/paginateParamsAccounts.dto";
import { AccountResponseDTO } from "./dtos/accountResponse.dto";
import { optionsBudgetPlan } from "../budget-plans/dto/optionsBudgetPlan.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";
/*
https://docs.nestjs.com/controllers#controllers
*/

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() data: CreateAccountDTO): Promise<void> {
    return await this.accountsService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(
    @Param() params: AccountsPaginateParams,
  ): Promise<AccountResponseDTO[]> {
    return await this.accountsService.findAll(params);
  }

  @Get("/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptions(): Promise<optionsBudgetPlan[]> {
    return this.accountsService.getOptions();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<Accounts> {
    return await this.accountsService.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateAccountDTO,
  ): Promise<void> {
    return await this.accountsService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async delete(@Param("id", ParseNumericIdPipe) id: number): Promise<void> {
    return await this.accountsService.delete(id);
  }
}
