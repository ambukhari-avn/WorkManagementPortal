// src/Web/src/app/shared/models/audit-log.model.ts
export interface AuditLog {
  id: number;
  entityName: string;
  entityId: number;
  action: string;
  changedByName: string;
  changedAt: string;
}