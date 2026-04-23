'use strict';

const Meta = require('./meta.model');
const Facets = require('./facets.model');

/**
 * Builds the standardized success response envelope.
 *
 * Shape:
 * {
 *   success   : true,
 *   message   : string,
 *   data      : object | array | null,
 *   meta      : Meta   | null,    // pagination + search metadata
 *   facets    : object | null,    // aggregated facet buckets (only when provided)
 *   timestamp : ISO-8601 string
 * }
 *
 * @example
 * const body = new SuccessResponse(
 *   'Products fetched',
 *   products,
 *   { query: 'iphone', page: 1, limit: 10, total: 125 },
 *   { brand: [{ name: 'Apple', count: 40 }] }
 * );
 * res.status(200).json(body);
 */
class SuccessResponse {
  /**
   * @param {string}            message        - Human-readable success message
   * @param {*}                 [data=null]    - The payload to return
   * @param {object|Meta|null}  [meta=null]    - Pagination / search metadata
   * @param {object|Facets|null}[facets=null]  - Aggregated facet buckets
   */
  constructor(message, data = null, meta = null, facets = null) {
    this.success = true;
    this.message = message;
    this.data = data !== undefined ? data : null;

    if (meta && !(meta instanceof Meta)) {
      this.meta = new Meta(meta);
    } else {
      this.meta = meta;
    }

    if (facets !== undefined && facets !== null) {
      this.facets = facets instanceof Facets
        ? facets
        : new Facets(facets);
    }

    this.timestamp = new Date().toISOString();
  }
}

module.exports = SuccessResponse;
