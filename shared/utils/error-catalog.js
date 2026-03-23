'use strict';

const AppError = require('../models/app-error.model');

/**
 * createErrorCatalog — helper to build an immutable dictionary of AppErrors.
 *
 * Each entry: { message, code, statusCode, errorNumber?, details? }
 * - code: string (e.g. 'DB_CONNECTION_FAILED')
 * - statusCode: HTTP status (503, 404, etc.)
 * - errorNumber: optional; when masked, body.error.statusCode = this (default 500)
 *
 * @example
 * const DB_ERRORS = createErrorCatalog({
 *   CONNECTION_FAILED : { message: 'Database connection failed', code: 'DB_CONNECTION_FAILED', statusCode: 503, errorNumber: 1001 },
 *   DUPLICATE_ENTRY   : { message: 'Duplicate entry', code: 'DB_DUPLICATE', statusCode: 409, errorNumber: 1002 },
 *   RECORD_NOT_FOUND  : { message: 'Record not found', code: 'NOT_FOUND', statusCode: 404 },
 * });
 */
function createErrorCatalog(definitions) {
  const catalog = {};
  for (const [key, def] of Object.entries(definitions)) {
    catalog[key] = new AppError(
      def.message,
      def.code,
      def.statusCode,
      def.details || null,
      def.errorNumber !== undefined ? def.errorNumber : 500
    );
  }
  return Object.freeze(catalog);
}

module.exports = { createErrorCatalog };
