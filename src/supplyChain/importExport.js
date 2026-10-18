/**
 * Supply Chain Data Ingestion & Import/Export Module
 *
 * Supports CSV and JSON imports with field-mapping, schema validation,
 * and descriptive error diagnostics. Never silently discards invalid records.
 *
 * @module supplyChain/importExport
 */

import {
  createSupplyChainTwin,
  normalizeFacility,
  normalizeSupplier,
  normalizeProduct,
  normalizeInventoryPosition,
  normalizeShipment,
  normalizeRouteLeg,
} from './model.js';

/**
 * Parses a simple CSV string into an array of object rows.
 * @param {string} csvText
 * @returns {{ headers: string[], rows: Array<Record<string, string>>, errors: string[] }}
 */
export function parseCsvText(csvText) {
  const errors = [];
  if (!csvText || typeof csvText !== 'string') {
    return { headers: [], rows: [], errors: ['CSV content must be a non-empty string'] };
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['CSV must have a header line and at least one data line'] };
  }

  // Parse header
  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: expected ${headers.length} columns, found ${values.length}. Line content: "${lines[i]}"`);
      continue;
    }

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row);
  }

  return { headers, rows, errors };
}

/**
 * Handles quoted CSV tokens with comma separators.
 */
function parseCsvLine(line) {
  const tokens = [];
  let inQuotes = false;
  let currentToken = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentToken += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      tokens.push(currentToken.trim());
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  tokens.push(currentToken.trim());
  return tokens;
}

/**
 * Imports facilities from CSV with field mapping.
 * @param {string} csvText
 * @param {Record<string, string>} fieldMapping
 * @returns {{ facilities: Object[], errors: string[], warnings: string[] }}
 */
export function importFacilitiesFromCsv(csvText, fieldMapping = {}) {
  const { rows, errors: parseErrors } = parseCsvText(csvText);
  const errors = [...parseErrors];
  const warnings = [];
  const facilities = [];

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    const mapped = {
      id: rawRow[fieldMapping.id || 'id'],
      name: rawRow[fieldMapping.name || 'name'],
      type: rawRow[fieldMapping.type || 'type'],
      latitude: rawRow[fieldMapping.latitude || 'latitude' || 'lat'],
      longitude: rawRow[fieldMapping.longitude || 'longitude' || 'lon' || 'lng'],
      country: rawRow[fieldMapping.country || 'country'],
      criticality: rawRow[fieldMapping.criticality || 'criticality'],
      capacity: rawRow[fieldMapping.capacity || 'capacity'],
      owner: rawRow[fieldMapping.owner || 'owner'],
      source: rawRow[fieldMapping.source || 'source'] || 'CSV Import',
    };

    const { record, errors: validationErrors } = normalizeFacility(mapped);
    if (validationErrors.length > 0) {
      errors.push(`Row ${i + 2} (ID: ${mapped.id || 'unknown'}): ${validationErrors.join(', ')}`);
    } else if (record) {
      facilities.push(record);
    }
  }

  return { facilities, errors, warnings };
}

/**
 * Imports shipments from CSV with field mapping.
 * @param {string} csvText
 * @param {Record<string, string>} fieldMapping
 * @returns {{ shipments: Object[], errors: string[], warnings: string[] }}
 */
export function importShipmentsFromCsv(csvText, fieldMapping = {}) {
  const { rows, errors: parseErrors } = parseCsvText(csvText);
  const errors = [...parseErrors];
  const warnings = [];
  const shipments = [];

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    const mapped = {
      id: rawRow[fieldMapping.id || 'id'],
      productId: rawRow[fieldMapping.productId || 'productId'],
      quantity: rawRow[fieldMapping.quantity || 'quantity'],
      origin: rawRow[fieldMapping.origin || 'origin'],
      destination: rawRow[fieldMapping.destination || 'destination'],
      carrier: rawRow[fieldMapping.carrier || 'carrier'],
      mode: rawRow[fieldMapping.mode || 'mode'],
      status: rawRow[fieldMapping.status || 'status'],
      ETA: rawRow[fieldMapping.ETA || 'ETA' || 'eta'],
      vesselReference: rawRow[fieldMapping.vesselReference || 'vesselReference'],
      source: rawRow[fieldMapping.source || 'source'] || 'CSV Import',
    };

    const { record, errors: validationErrors } = normalizeShipment(mapped);
    if (validationErrors.length > 0) {
      errors.push(`Row ${i + 2} (ID: ${mapped.id || 'unknown'}): ${validationErrors.join(', ')}`);
    } else if (record) {
      shipments.push(record);
    }
  }

  return { shipments, errors, warnings };
}

/**
 * Imports complete supply chain twin from a JSON string or object.
 * @param {string|Object} jsonInput
 * @returns {{ twin: Object, errors: string[], warnings: string[] }}
 */
export function importSupplyChainTwinFromJson(jsonInput) {
  let parsed;
  try {
    parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
  } catch (err) {
    return {
      twin: null,
      errors: [`JSON parse failure: ${err.message}`],
      warnings: [],
    };
  }

  return createSupplyChainTwin(parsed);
}

/**
 * Serializes the twin to standard formatted JSON.
 * @param {Object} twin
 * @returns {string}
 */
export function exportSupplyChainTwinToJson(twin) {
  return JSON.stringify(twin, null, 2);
}
