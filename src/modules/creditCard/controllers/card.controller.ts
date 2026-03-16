// card.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreditCardService } from "../services/creditCard.service";
import { CreditCardPaginateParams } from "../dtos/creditCard/paginateParamsCreditCard.dto";
import { CreditCard } from "../entities/creditCard.entity";
import { UpdateCreditCardDTO } from "../dtos/creditCard/updateCreditCard";
import { CreateCreditCardDTO } from "../dtos/creditCard/createCreditCard.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";

@Controller("cards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardController {
  constructor(private readonly creditCardService: CreditCardService) {}

  @Post()
  async create(@Body() data: CreateCreditCardDTO): Promise<void> {
    return await this.creditCardService.create(data);
  }

  @Get()
  async findAll(
    @Query() params: CreditCardPaginateParams,
  ): Promise<Pagination<CreditCard, IPaginationMeta>> {
    return await this.creditCardService.findAll(params);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<CreditCard> {
    return await this.creditCardService.findById(id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateCreditCardDTO,
  ): Promise<void> {
    return await this.creditCardService.update(id, data);
  }

  @Delete(":id")
  async toggle(@Param("id", ParseNumericIdPipe) id: number): Promise<void> {
    return await this.creditCardService.toggleCreditCard(id);
  }
}
