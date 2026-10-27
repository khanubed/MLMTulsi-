import { logger } from '../../lib/logger';

export interface AuditLogInput {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  static async record(input: AuditLogInput) {
    logger.info('Audit event recorded', {
      userId: input.actorUserId,
      action: input.action,
      meta: {
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}
