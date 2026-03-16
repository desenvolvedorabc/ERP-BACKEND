import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { Token } from "../entities/token.entity";
import { CreateTokenDTO } from "../dto/createToken.dto";

@Injectable()
export class TokenRepository extends BaseRepository<TokenRepository> {
  constructor(dataSource: DataSource) {
    super(Token, dataSource);
  }

  async _create(data: CreateTokenDTO): Promise<void> {
    const newContract = await this.getRepository(Token).create(data);
    await this._clearTokenCache();
    await this.getRepository(Token).save(newContract);
  }

  async _findFirst(): Promise<Token> {
    const tokens = await this.getRepository(Token).find({
      cache: { id: "tokenCache", milliseconds: 3550000 },
    });
    return tokens?.[0] ?? null;
  }

  async _clear(): Promise<void> {
    await this.getRepository(Token).clear();
  }

  async _clearTokenCache(): Promise<void> {
    await this.dataSource.queryResultCache.remove(["tokenCache"]);
  }
}
