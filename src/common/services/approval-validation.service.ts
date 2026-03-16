import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PayableStatus } from 'src/modules/payables/enums';

@Injectable()
export class ApprovalValidationService {
  constructor(private dataSource: DataSource) {}

  /**
   * Verifica se um usuário tem despesas em aprovação
   */
  async hasUserPendingApprovals(userId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(1)', 'count')
      .from('approvals', 'approval')
      .innerJoin('payables', 'payable', 'payable.id = approval.payableId')
      .where('approval.userId = :userId', { userId })
      .andWhere('approval.approved IS NULL')
      .andWhere('payable.payableStatus = :status', { status: PayableStatus.APPROVING })
      .getRawOne();

    return parseInt(result.count) > 0;
  }

  /**
   * Verifica se um colaborador tem despesas em aprovação
   */
  async hasCollaboratorPendingApprovals(collaboratorId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(1)', 'count')
      .from('approvals', 'approval')
      .innerJoin('payables', 'payable', 'payable.id = approval.payableId')
      .where('approval.collaboratorId = :collaboratorId', { collaboratorId })
      .andWhere('approval.approved IS NULL')
      .andWhere('payable.payableStatus = :status', { status: PayableStatus.APPROVING })
      .getRawOne();

    return parseInt(result.count) > 0;
  }

  /**
   * Verifica se um usuário tem despesas em aprovação através do colaborador associado
   */
  async hasUserPendingApprovalsThroughCollaborator(userId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(1)', 'count')
      .from('users', 'user')
      .innerJoin('approvals', 'approval', 'approval.collaboratorId = user.collaboratorId')
      .innerJoin('payables', 'payable', 'payable.id = approval.payableId')
      .where('user.id = :userId', { userId })
      .andWhere('user.collaboratorId IS NOT NULL')
      .andWhere('approval.approved IS NULL')
      .andWhere('payable.payableStatus = :status', { status: PayableStatus.APPROVING })
      .getRawOne();

    return parseInt(result.count) > 0;
  }
}
