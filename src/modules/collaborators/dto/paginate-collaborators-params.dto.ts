import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, IsArray } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import {
  GenderIdentity,
  Race,
  Education,
  RegistrationStatus,
  OccupationArea,
  EmploymentRelationship,
  DisableBy,
} from "../enum";

export class PaginateCollaboratorsParams extends PaginateParams {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  age: string = null;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  yearOfContract: string;

  @ApiProperty({
    enum: GenderIdentity,
    required: false,
    isArray: true,
  })
  @IsEnum(GenderIdentity, { each: true })
  @IsArray()
  @IsOptional()
  genderIdentities: GenderIdentity[];

  @ApiProperty({
    enum: Race,
    required: false,
    isArray: true,
  })
  @IsEnum(Race, { each: true })
  @IsArray()
  @IsOptional()
  breeds: Race[];

  @ApiProperty({
    enum: Education,
    required: false,
    isArray: true,
  })
  @IsEnum(Education, { each: true })
  @IsArray()
  @IsOptional()
  educations: Education[];

  @ApiProperty({
    enum: RegistrationStatus,
    required: false,
    isArray: true,
  })
  @IsEnum(RegistrationStatus, { each: true })
  @IsArray()
  @IsOptional()
  status: RegistrationStatus[];

  @ApiProperty({
    enum: OccupationArea,
    required: false,
    isArray: true,
  })
  @IsEnum(OccupationArea, { each: true })
  @IsArray()
  @IsOptional()
  occupationAreas: OccupationArea[];

  @ApiProperty({
    enum: EmploymentRelationship,
    required: false,
    isArray: true,
  })
  @IsEnum(EmploymentRelationship, { each: true })
  @IsArray()
  @IsOptional()
  employmentRelationships: EmploymentRelationship[];

  @ApiProperty({
    enum: DisableBy,
    required: false,
    isArray: true,
  })
  @IsEnum(DisableBy, { each: true })
  @IsArray()
  @IsOptional()
  disableBy: DisableBy[];

  @ApiProperty({
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  roles: string[];
}
