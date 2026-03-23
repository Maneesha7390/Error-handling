'use strict';

/**
 * Represents a single validation / field-level error detail.
 *
 * @example
 * new ErrorDetail('email', 'Email is required')
 * // => { field: 'email', message: 'Email is required' }
 */
class ErrorDetail {
  /**
   * @param {string} field   - The field that caused the error
   * @param {string} message - Human-readable explanation
   */
  constructor(field, message) {
    this.field = field;
    this.message = message;
  }
}

module.exports = ErrorDetail;
