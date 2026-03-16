/* eslint-disable no-case-declarations */
import { BudgetResultData } from "src/modules/budgets/repositories/typeorm/budget-results-repository";
import { SubCategoryReleaseType } from "src/modules/cost-centers/enum";

export function calcTotalValueInCents(
  releaseType: SubCategoryReleaseType,
  item: Partial<BudgetResultData>,
) {
  switch (releaseType) {
    case SubCategoryReleaseType.IPCA:
      return item.baseValueInCents * (item.ipca / 100) + item.baseValueInCents;

    case SubCategoryReleaseType.CAED:
      return item?.numberOfEnrollments * item.baseValueInCents;

    case SubCategoryReleaseType.DESPESAS_PESSOAIS:
      const totalSalary =
        (item?.salaryAdjustment / 100) * item?.salaryInCents +
        item.salaryInCents;

      const totalCharges =
        (item.inssEmployer / 100) * totalSalary +
        (item.inss / 100) * totalSalary +
        (item.fgtsCharges / 100) * totalSalary +
        (item.pisCharges / 100) * totalSalary;

      const totalBenefits =
        item.foodVoucherInCents +
        item.transportationVouchersInCents +
        item.healthInsuranceInCents +
        item.lifeInsuranceInCents;

      const totalProvisions =
        item.holidaysAndChargesInCents +
        item.allowanceInCents +
        item.thirteenthInCents +
        item.fgtsInCents;

      return totalSalary + totalCharges + totalBenefits + totalProvisions;
    case SubCategoryReleaseType.DESPESAS_LOGISTICAS:
      const totalTripsOfPeople = item?.numberOfPeople * item?.totalTrips;

      const totalAirfareInCents = totalTripsOfPeople * item?.airfareInCents;

      const totalAccommodationInCents =
        totalTripsOfPeople *
        item.dailyAccommodation *
        item?.accommodationInCents;

      const totalExpenses =
        totalTripsOfPeople * item.dailyFood * item?.foodInCents +
        totalTripsOfPeople * item.dailyTransport * item?.transportInCents +
        totalTripsOfPeople * item.dailyCarAndFuel * item?.carAndFuelInCents;

      return totalAirfareInCents + totalAccommodationInCents + totalExpenses;
    default:
      return item.baseValueInCents;
  }
}
