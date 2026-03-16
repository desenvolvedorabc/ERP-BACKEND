import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { generatePasswordAndUsername } from "src/common/utils/generate-password-username";
import { sendEmailApprovePayable } from "src/mails";
import { CollaboratorsService } from "../../collaborators/collaborators.service";
import { ApprovalCredentialsDTO } from "../dto/approvals/approvalCredentials.dto";
import { ApproveDataDTO } from "../dto/approvals/approveData.dto";
import { CreateApprovalDTO } from "../dto/approvals/createApproval.dto";
import { GenerateApprovalsDTO } from "../dto/approvals/generateApprovals.dto";
import { ResponseApprovalDTO } from "../dto/approvals/responseApproval.dto";
import { Approvals } from "../entities/approval.entity";
import {
  AlreadyApprovedError,
  ApprovalError,
  ForbiddenApprovalError,
  GenerateApprovalsError,
  NotFoundApprovalError,
} from "../errors/ApprovalsErrors";
import { ApprovalsRepository } from "../repositories/approval-repository";
import { PayableService } from "./payable.service";
import { MassApprovalDataDTO } from "../dto/massApprovals/massApprovalData.dto";

@Injectable()
export class ApprovalsService {
  constructor(
    private approvalsRepository: ApprovalsRepository,
    private collaboratorsService: CollaboratorsService,
    @Inject(forwardRef(() => PayableService))
    private payableService: PayableService,
  ) {}

  async generateApprovals(data: GenerateApprovalsDTO): Promise<void> {
    const approvers = await this.collaboratorsService.findManyById(
      data.approvers,
    );

    const approvals: Array<CreateApprovalDTO> = [];

    const emails: Array<{
      id: number;
      email: string;
      identifierCode: string;
      password: string;
    }> = [];

    try {
      approvers.map(async (approver) => {
        const { password } = generatePasswordAndUsername();

        approvals.push(
          new CreateApprovalDTO({
            collaboratorId: approver.id,
            payableId: data.payableId,
            password,
          }),
        );

        emails.push({
          id: data.payableId,
          email: approver.email,
          identifierCode: data.identifierCode,
          password,
        });
      });

      await this.create(approvals);

      await Promise.all(emails.map((email) => {
        return sendEmailApprovePayable(email);
      }));
    } catch (error) {
      console.error(error);
      throw new GenerateApprovalsError();
    }
  }

  async create(data: Array<CreateApprovalDTO>): Promise<void> {
    await this.approvalsRepository._create(data);
  }

  async checkCredentials(
    data: ApprovalCredentialsDTO,
  ): Promise<ResponseApprovalDTO> {
    const approval = await this.checkIfExistsAndIsApproved(data);
    return new ResponseApprovalDTO(approval);
  }

  async approve(id: number, data: ApproveDataDTO): Promise<void> {
    await this.checkCredentials(data);
    await this.existsById(id);
    await this.isApprovedById(id);

    try {
      if (data.approved) {
        await this.approvalsRepository._approveById(id);

        const fullyApproved = await this.approvalsRepository._isFullyApproved(
          data.payableId,
        );
        
        if (fullyApproved) {
          await this.payableService.approvePayable(data.payableId);
        }
      } else {
        await this.approvalsRepository._rejectById(id, data.obs);
        await this.payableService.rejectPayable(data.payableId, data.obs);
      }
    } catch (error) {
      console.error(`[ERROR] Erro na aprovação - ID: ${id}, PayableID: ${data.payableId}:`, error);
      throw new ApprovalError();
    }
  }

  async massApproval(ids: number[], data: MassApprovalDataDTO): Promise<void> {
    try {
      const approvals = await this.approvalsRepository._findManyById(ids);
      const payablesIds = approvals.map((a) => a.payableId);

      if (data.approved) {
        await this.approvalsRepository._approveManyById(ids);

        const fullyApproveds =
          await this.approvalsRepository._isAnyFullyApproved(payablesIds);
        
        await this.payableService.approveManyPayable(
          payablesIds,
          fullyApproveds,
          approvals[0].userId,
        );
      } else {
        await this.approvalsRepository._rejectManyById(ids, data.obs);
        await this.payableService.rejectManyPayable(
          payablesIds,
          data.obs,
          approvals[0].userId,
        );
      }
    } catch (error) {
      console.error(error);
      throw new ApprovalError();
    }
  }

  async getApprovers(payableId: number): Promise<number[]> {
    return await this.approvalsRepository._getApprovers(payableId);
  }

  async deleteAllApprovations(payableId: number): Promise<void> {
    await this.approvalsRepository._deleteByPayableId(payableId);
  }

  async hasPendingApprovalsByUserId(userId: number): Promise<boolean> {
    return await this.approvalsRepository._hasPendingApprovalsByUserId(userId);
  }


  private async checkIfExistsAndIsApproved(
    data: ApprovalCredentialsDTO,
  ): Promise<Approvals> {
    const approval =
      await this.approvalsRepository._findByPayableAndPassword(data);
    if (!approval) {
      throw new ForbiddenApprovalError();
    }
    if (approval.approved !== null) {
      throw new AlreadyApprovedError();
    }

    return approval;
  }

  private async existsById(id: number): Promise<void> {
    const approve = await this.approvalsRepository._findById(id);
    if (!approve) {
      throw new NotFoundApprovalError();
    }
  }

  private async isApprovedById(id: number): Promise<void> {
    const approved = await this.approvalsRepository._isApproved(id);
    if (approved) {
      throw new AlreadyApprovedError();
    }
  }
}
