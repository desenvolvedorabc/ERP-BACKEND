import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsEnum,
  IsNumber,
} from "class-validator";
import {
  CreateBudgetResultMonthDto,
  CreateBudgetResultDto,
} from "./create-budget-result.dto";
import {
  Education,
  EmploymentRelationship,
} from "src/modules/collaborators/enum";

class CreateBudgetResultPersonalExpensesMonthDto extends CreateBudgetResultMonthDto {
  @ApiProperty({
    enum: Education,
  })
  @IsEnum(Education)
  @IsNotEmpty({
    message: "Informe a escolaridade.",
  })
  education: Education;

  @ApiProperty({
    enum: EmploymentRelationship,
  })
  @IsEnum(EmploymentRelationship)
  @IsNotEmpty({
    message: "Informe o vínculo empregatício.",
  })
  employmentRelationship: EmploymentRelationship;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  numberOfFinancialDirectors: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  salaryInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  salaryAdjustment: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  inssEmployer: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  inss: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  fgtsCharges: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  pisCharges: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  transportationVouchersInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  foodVoucherInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  healthInsuranceInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  lifeInsuranceInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  holidaysAndChargesInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  allowanceInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  thirteenthInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  fgtsInCents: number;
}

export class CreateBudgetResultPersonalExpensesDto extends CreateBudgetResultDto {
  @ApiProperty({
    isArray: true,
    type: CreateBudgetResultPersonalExpensesMonthDto,
  })
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetResultPersonalExpensesMonthDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  months: CreateBudgetResultPersonalExpensesMonthDto[];
}
