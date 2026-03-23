'use strict';

/**
 * AppError — a throwable custom error that carries a string code,
 * HTTP status code, and optional errorNumber for masked responses.
 *
 * @example
 * // code = string, statusCode = HTTP status, errorNumber = used in body when masked
 * const DB_ERRORS = {
 *   CONNECTION_FAILED : new AppError('Database connection failed', 'DB_CONNECTION_FAILED', 503, null, 1001),
 *   DUPLICATE_ENTRY   : new AppError('Duplicate entry', 'DB_DUPLICATE', 409, null, 1002),
 * };
 */
class AppError extends Error {
  /**
   * @param {string}                    message     - Human-readable error message
   * @param {string}                    code        - Error code string (e.g. 'DB_CONNECTION_FAILED')
   * @param {number}                    [statusCode=500]  - HTTP status code
   * @param {Array<{field,message}>|null} [details=null] - Optional per-field validation details
   * @param {number}                    [errorNumber=500] - When masked: body.error.statusCode = this
   */
  constructor(message, code, statusCode = 500, details = null, errorNumber = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.errorNumber = errorNumber;
  }
}

module.exports = AppError;
