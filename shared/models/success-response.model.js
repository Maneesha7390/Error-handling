'use strict';

const Meta = require('./meta.model');

/**
 * Builds the standardized success response envelope.
 *
 * Shape:
 * {
 *   success   : true,
 *   message   : string,
 *   data      : object | array | null,
 *   meta      : { page, limit, total, totalPages } | null,
 *   timestamp : ISO-8601 string
 * }
 *
 * @example
 * const body = new SuccessResponse('User fetched successfully', user, metaOptions);
 * res.status(200).json(body);
 */
class SuccessResponse {
  /**
   * @param {string}          message  - Human-readable success message
   * @param {*}               [data=null]    - The payload to return
   * @param {object|Meta|null} [meta=null]  - Pagination metadata (optional)
   */
  constructor(message, data = null, meta = null) {
    this.success = true;
    this.message = message;
    this.data = data !== undefined ? data : null;

    if (meta && !(meta instanceof Meta)) {
      // Accept a plain object and convert it automatically
      this.meta = new Meta(meta);
    } else {
      this.meta = meta;   // null or already a Meta instance
    }

    this.timestamp = new Date().toISOString();
  }
}

module.exports = SuccessResponse;
