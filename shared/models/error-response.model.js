'use strict';

/**
 * Builds the standardized error response envelope.
 *
 * Shape:
 * {
 *   success   : false,
 *   message   : string,
 *   error     : {
 *     code       : string,
 *     statusCode : number,
 *     details    : Array<{ field, message }> | null
 *   },
 *   timestamp : ISO-8601 string
 * }
 *
 * @example
 * // Simple error (no field details)
 * const body = new ErrorResponse('User not found', 'USER_NOT_FOUND', 404);
 * res.status(404).json(body);
 *
 * @example
 * // Validation error with field details
 * const details = [
 *   new ErrorDetail('email', 'Email is required'),
 *   new ErrorDetail('password', 'Password must be at least 8 characters'),
 * ];
 * const body = new ErrorResponse('Validation failed', 'VALIDATION_ERROR', 422, details);
 * res.status(422).json(body);
 */
class ErrorResponse {
  /**
   * @param {string}               message    - Human-readable error message
   * @param {string}               code       - Machine-readable error code (e.g. 'USER_NOT_FOUND')
   * @param {number}               statusCode - HTTP status code
   * @param {Array<object>|null}   [details=null] - Optional per-field validation details
   */
  constructor(message, code, statusCode, details = null) {
    this.success = false;
    this.message = message;
    this.error = {
      code,
      statusCode,
      details: details && details.length > 0 ? details : null,
    };
    this.timestamp = new Date().toISOString();
  }
}

module.exports = ErrorResponse;
