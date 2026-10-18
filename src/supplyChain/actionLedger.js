/**
 * Supply Chain Action Ledger & Immutable Audit Trail
 *
 * Manages operational decision lifecycle:
 * Pending → Approved → Executing → Completed (or Rejected)
 *
 * Enforces valid state transitions and records every change with actor,
 * timestamp, and reason in an append-only audit trail.
 *
 * @module supplyChain/actionLedger
 */

import { ACTION_STATUSES, normalizeAction } from './model.js';

export const VALID_TRANSITIONS = Object.freeze({
  pending: ['approved', 'rejected'],
  approved: ['executing', 'rejected'],
  executing: ['completed', 'rejected'],
  completed: [],
  rejected: [],
});

/**
 * Validates whether a status transition is permitted.
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, targetStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(targetStatus));
}

/**
 * Creates a fresh action from a simulated recovery scenario.
 * @param {Object} scenario
 * @param {Object} options
 * @returns {Object} Action record
 */
export function createActionFromScenario(scenario, { owner = 'UNASSIGNED', expectedOutcome = null } = {}) {
  const id = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  const raw = {
    id,
    type: scenario.actionType || scenario.type || 'reroute_shipment',
    recommendationId: scenario.id,
    owner,
    status: 'pending',
    approvalMetadata: null,
    expectedOutcome: expectedOutcome || scenario.inventoryImpactLabel || scenario.name,
    actualOutcome: null,
    createdAt: now,
    auditTrail: [
      {
        timestamp: now,
        state: 'pending',
        actor: 'RECOVERY_ENGINE',
        details: `Action proposed from scenario: ${scenario.name}`,
      },
    ],
  };

  const { record } = normalizeAction(raw);
  return record;
}

/**
 * Transitions an action to Approved.
 * @param {Object} action
 * @param {Object} approvalInfo
 * @returns {{ action: Object, error: string|null }}
 */
export function approveAction(action, { approvedBy = 'Director', notes = '', owner = null, timestamp = null } = {}) {
  if (!isValidTransition(action.status, 'approved')) {
    return { action, error: `Cannot transition action from "${action.status}" to "approved"` };
  }

  const time = timestamp || new Date().toISOString();
  const assignedOwner = owner || action.owner || approvedBy;

  const updated = {
    ...action,
    status: 'approved',
    owner: assignedOwner,
    approvalMetadata: {
      approvedBy,
      approvedAt: time,
      notes,
    },
    auditTrail: [
      ...action.auditTrail,
      {
        timestamp: time,
        state: 'approved',
        actor: approvedBy,
        details: `Approved by ${approvedBy}. Owner assigned: ${assignedOwner}.${notes ? ` Notes: ${notes}` : ''}`,
      },
    ],
  };

  return { action: updated, error: null };
}

/**
 * Transitions an action to Executing.
 * @param {Object} action
 * @param {Object} params
 * @returns {{ action: Object, error: string|null }}
 */
export function executeAction(action, { actor = 'SYSTEM', details = 'Execution commenced', timestamp = null } = {}) {
  if (!isValidTransition(action.status, 'executing')) {
    return { action, error: `Cannot transition action from "${action.status}" to "executing"` };
  }

  const time = timestamp || new Date().toISOString();
  const updated = {
    ...action,
    status: 'executing',
    auditTrail: [
      ...action.auditTrail,
      {
        timestamp: time,
        state: 'executing',
        actor,
        details,
      },
    ],
  };

  return { action: updated, error: null };
}

/**
 * Transitions an action to Completed with verified actual outcome.
 * @param {Object} action
 * @param {Object} params
 * @returns {{ action: Object, error: string|null }}
 */
export function completeAction(action, { actor = 'OPERATOR', actualOutcome = 'Delivered successfully', timestamp = null } = {}) {
  if (!isValidTransition(action.status, 'completed')) {
    return { action, error: `Cannot transition action from "${action.status}" to "completed"` };
  }

  const time = timestamp || new Date().toISOString();
  const updated = {
    ...action,
    status: 'completed',
    actualOutcome,
    auditTrail: [
      ...action.auditTrail,
      {
        timestamp: time,
        state: 'completed',
        actor,
        details: `Action completed. Outcome: ${actualOutcome}`,
      },
    ],
  };

  return { action: updated, error: null };
}

/**
 * Transitions an action to Rejected.
 * @param {Object} action
 * @param {Object} params
 * @returns {{ action: Object, error: string|null }}
 */
export function rejectAction(action, { actor = 'OPERATOR', reason = 'Operational rejection', timestamp = null } = {}) {
  if (!isValidTransition(action.status, 'rejected')) {
    return { action, error: `Cannot transition action from "${action.status}" to "rejected"` };
  }

  const time = timestamp || new Date().toISOString();
  const updated = {
    ...action,
    status: 'rejected',
    actualOutcome: `Rejected: ${reason}`,
    auditTrail: [
      ...action.auditTrail,
      {
        timestamp: time,
        state: 'rejected',
        actor,
        details: `Action rejected by ${actor}. Reason: ${reason}`,
      },
    ],
  };

  return { action: updated, error: null };
}

/**
 * ActionLedger container managing action states in memory
 */
export class ActionLedger {
  constructor(initialActions = []) {
    this.actions = new Map();
    for (const act of initialActions) {
      const { record } = normalizeAction(act);
      if (record) this.actions.set(record.id, record);
    }
  }

  getAll() {
    return Array.from(this.actions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id) {
    return this.actions.get(id) || null;
  }

  getByStatus(status) {
    return this.getAll().filter((a) => a.status === status);
  }

  add(action) {
    const { record, errors } = normalizeAction(action);
    if (errors.length > 0) throw new Error(`Invalid action: ${errors.join(', ')}`);
    this.actions.set(record.id, record);
    return record;
  }

  approve(id, options = {}) {
    const action = this.getById(id);
    if (!action) throw new Error(`Action "${id}" not found`);
    const { action: updated, error } = approveAction(action, options);
    if (error) throw new Error(error);
    this.actions.set(id, updated);
    return updated;
  }

  execute(id, options = {}) {
    const action = this.getById(id);
    if (!action) throw new Error(`Action "${id}" not found`);
    const { action: updated, error } = executeAction(action, options);
    if (error) throw new Error(error);
    this.actions.set(id, updated);
    return updated;
  }

  complete(id, options = {}) {
    const action = this.getById(id);
    if (!action) throw new Error(`Action "${id}" not found`);
    const { action: updated, error } = completeAction(action, options);
    if (error) throw new Error(error);
    this.actions.set(id, updated);
    return updated;
  }

  reject(id, options = {}) {
    const action = this.getById(id);
    if (!action) throw new Error(`Action "${id}" not found`);
    const { action: updated, error } = rejectAction(action, options);
    if (error) throw new Error(error);
    this.actions.set(id, updated);
    return updated;
  }
}
