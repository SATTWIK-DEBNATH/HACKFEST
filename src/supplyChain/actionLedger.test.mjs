import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ActionLedger,
  isValidTransition,
  approveAction,
  executeAction,
  completeAction,
  rejectAction,
} from './actionLedger.js';
import { normalizeAction } from './model.js';

test('isValidTransition strictly enforces permitted lifecycle progression', () => {
  // Valid transitions
  assert.equal(isValidTransition('pending', 'approved'), true);
  assert.equal(isValidTransition('pending', 'rejected'), true);
  assert.equal(isValidTransition('approved', 'executing'), true);
  assert.equal(isValidTransition('executing', 'completed'), true);
  assert.equal(isValidTransition('executing', 'rejected'), true);

  // Invalid transitions
  assert.equal(isValidTransition('pending', 'completed'), false);
  assert.equal(isValidTransition('completed', 'executing'), false);
  assert.equal(isValidTransition('completed', 'pending'), false);
  assert.equal(isValidTransition('rejected', 'approved'), false);
});

test('approveAction updates status, records owner, approval metadata, and appends to audit trail', () => {
  const { record: action } = normalizeAction({
    id: 'ACT-TEST-01',
    type: 'reroute_shipment',
    owner: 'UNASSIGNED',
    status: 'pending',
  });

  const { action: approved, error } = approveAction(action, {
    approvedBy: 'Director Lin',
    notes: 'Approved for execution',
    owner: 'Operations Dispatcher Dave',
    timestamp: '2026-10-18T12:00:00Z',
  });

  assert.equal(error, null);
  assert.equal(approved.status, 'approved');
  assert.equal(approved.owner, 'Operations Dispatcher Dave');
  assert.equal(approved.approvalMetadata.approvedBy, 'Director Lin');
  assert.equal(approved.approvalMetadata.notes, 'Approved for execution');

  // Audit trail appended
  assert.equal(approved.auditTrail.length, 2);
  const lastEntry = approved.auditTrail[1];
  assert.equal(lastEntry.state, 'approved');
  assert.equal(lastEntry.actor, 'Director Lin');
});

test('ActionLedger executes end-to-end lifecycle and preserves immutable history', () => {
  const ledger = new ActionLedger();
  const raw = {
    id: 'ACT-LIFECYCLE-01',
    type: 'transfer_inventory',
    owner: 'Sarah Lin',
    status: 'pending',
    expectedOutcome: 'Restore 12 days cover',
  };

  const created = ledger.add(raw);
  assert.equal(created.status, 'pending');

  // 1. Approve
  const approved = ledger.approve(created.id, { approvedBy: 'VP Operations', notes: 'Urgent transfer' });
  assert.equal(approved.status, 'approved');

  // 2. Execute
  const executing = ledger.execute(created.id, { actor: 'Changi Logistics Dispatch', details: 'Pallets released to air freight' });
  assert.equal(executing.status, 'executing');

  // 3. Complete
  const completed = ledger.complete(created.id, {
    actor: 'Long Beach Receiver',
    actualOutcome: '600 units received intact. Stock cover restored to 5.6 days.',
  });
  assert.equal(completed.status, 'completed');
  assert.match(completed.actualOutcome, /Stock cover restored/i);

  // Assert audit trail has 4 chronological entries
  assert.equal(completed.auditTrail.length, 4);
  assert.equal(completed.auditTrail[0].state, 'pending');
  assert.equal(completed.auditTrail[1].state, 'approved');
  assert.equal(completed.auditTrail[2].state, 'executing');
  assert.equal(completed.auditTrail[3].state, 'completed');

  // 4. Invalid transition after completion throws error
  assert.throws(() => {
    ledger.execute(created.id);
  }, /Cannot transition action from "completed"/);
});
