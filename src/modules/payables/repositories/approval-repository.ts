import { Injectable } from "@nestjs/common";
import { DataSource, In, IsNull } from "typeorm";
import { ApprovalCredentialsDTO } from "../dto/approvals/approvalCredentials.dto";
import { CreateApprovalDTO } from "../dto/approvals/createApproval.dto";
import { Approvals } from "../entities/approval.entity";
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class ApprovalsRepository extends BaseRepository<Approvals> {
  constructor(dataSource: DataSource) {
    super(Approvals, dataSource);
  }

  async _create(data: Array<CreateApprovalDTO>): Promise<void> {
    const newApproval = await this.getRepository(Approvals).create(data);
    await this.getRepository(Approvals).save(newApproval);
  }

  async _findById(id: number): Promise<Approvals> {
    return await this.getRepository(Approvals).findOne({ where: { id } });
  }

  async _findManyById(ids: number[]): Promise<Approvals[]> {
    return await this.getRepository(Approvals).find({ where: { id: In(ids) } });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Approvals).delete({ id });
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(Approvals).exist({ where: { id } });
  }

  async _approveById(id: number): Promise<void> {
    await this.getRepository(Approvals).update({ id }, { approved: true });
  }

  async _approveManyById(ids: number[]): Promise<void> {
    await this.getRepository(Approvals).update(
      { id: In(ids) },
      { approved: true },
    );
  }

  async _rejectById(id: number, obs?: string): Promise<void> {
    await this.getRepository(Approvals).update(
      { id },
      { approved: false, obs },
    );
  }

  async _rejectManyById(ids: number[], obs?: string): Promise<void> {
    await this.getRepository(Approvals).update(
      { id: In(ids) },
      { approved: false, obs },
    );
  }

  async _isFullyApproved(payableId: number): Promise<boolean> {
    try {
      const approvals = await this.getRepository(Approvals).find({
        where: { payableId },
        select: ['id', 'approved', 'payableId']
      });

      const hasUnapproved = approvals.some(approval => 
        approval.approved === null || approval.approved === false
      );

      const isFullyApproved = !hasUnapproved;

      return isFullyApproved;
    } catch (error) {
      console.error(`[ERROR] Erro ao verificar aprovação completa para payable ${payableId}:`, error);
      return false;
    }
  }

  async _isAnyFullyApproved(payableIds: number[]): Promise<number[]> {
    const allApprovals = await this.getRepository(Approvals).find({
      where: {
        payableId: In(payableIds)
      }
    });

    const approvalsByPayable: Map<number, Approvals[]> = new Map();
    allApprovals.forEach(approval => {
      if (!approvalsByPayable.has(approval.payableId)) {
        approvalsByPayable.set(approval.payableId, []);
      }
      approvalsByPayable.get(approval.payableId).push(approval);
    });

    const fullyApproved = payableIds.filter(payableId => {
      const approvals = approvalsByPayable.get(payableId) || [];
      if (approvals.length === 0) return false;
      return approvals.every(a => a.approved === true);
    });

    return fullyApproved;
  }

  async _isApproved(id: number): Promise<boolean> {
    const approval = await this.getRepository(Approvals).findOne({
      where: { id },
    });
    return approval.approved !== null;
  }

  async _findByPayableAndPassword({
    payableId,
    password,
  }: ApprovalCredentialsDTO): Promise<Approvals> {
    return await this.getRepository(Approvals).findOne({
      where: { payableId, password },
    });
  }

  async _deleteByPayableId(payableId: number): Promise<void> {
    await this.getRepository(Approvals).delete({ payableId });
  }

  async _getApprovers(payableId: number): Promise<number[]> {
    const approvers = await this.getRepository(Approvals).find({
      where: { payableId },
      select: { collaboratorId: true },
    });
    return approvers.map((a) => a.collaboratorId);
  }

  async _hasPendingApprovalsByUserId(userId: number): Promise<boolean> {
    const pendingApprovals = await this.getRepository(Approvals).find({
      where: { 
        userId,
        approved: IsNull()
      },
      select: ['id']
    });
    
    return pendingApprovals.length > 0;
  }

  async _findByPayableIds(payableIds: number[]): Promise<Approvals[]> {
    return await this.getRepository(Approvals).find({
      where: {
        payableId: In(payableIds)
      },
      relations: ['collaborator', 'user']
    });
  }
}
