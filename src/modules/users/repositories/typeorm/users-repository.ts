import { DataSource, In } from "typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "../../entities/user.entity";
import { CreateUserDto } from "../../dto/create-user.dto";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { paginateData } from "src/common/utils/paginate-data";
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource);
  }

  async _create(createUserDto: CreateUserDto) {
    const { name, email, cpf, telephone, imageUrl, password, massApprovalPermission, collaboratorId } = createUserDto;
    const user = this.getRepository(User).create({
      name,
      email,
      cpf,
      telephone,
      imageUrl,
      password,
      massApprovalPermission,
      collaboratorId,
    });

    return await this.getRepository(User).save(user);
  }

  async _findAll(
    { page, limit, search, active }: PaginateParams,
    userId: number,
  ) {
    const queryBuilder = this.getRepository(User)
      .createQueryBuilder("Users")
      .select([
        "Users.id",
        "Users.name",
        "Users.email",
        "Users.cpf",
        "Users.active",
      ])
      .where("Users.id != :userId", { userId })
      .orderBy("Users.name", "ASC");

    if (search) {
      queryBuilder.andWhere("Users.name LIKE :q", { q: `%${search}%` });
    }

    if (active !== null) {
      queryBuilder.andWhere("Users.active = :active", { active });
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }

  async _findOneById(id: number) {
    const user = await this.getRepository(User).findOne({
      where: {
        id,
      },
    });

    return {
      user,
    };
  }

  async _findManyById(ids: number[]) {
    return await this.getRepository(User).find({
      where: {
        id: In(ids),
      },
    });
  }

  async _findUserByCpf(cpf: string): Promise<{ user: User | null }> {
    const user = await this.getRepository(User).findOne({
      where: {
        cpf,
      },
    });

    return {
      user,
    };
  }

  async _update(id: number, data: Partial<User>) {
    return await this.getRepository(User).save({ id, ...data });
  }

  async _findUserByEmail(email: string): Promise<{ user: User | null }> {
    const user = await this.getRepository(User).findOne({
      where: {
        email,
      },
    });

    return {
      user,
    };
  }

  async _findMassApprovalUsers(): Promise<Pick<User, "id" | "email">[]> {
    return await this.getRepository(User).find({
      where: { massApprovalPermission: true, active: true },
      select: { id: true, email: true },
    });
  }
}
