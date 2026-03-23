'use strict';

/**
 * Represents pagination metadata attached to a success response.
 *
 * @example
 * const meta = new Meta({ page: 1, limit: 10, total: 120 });
 * // => { page: 1, limit: 10, total: 120, totalPages: 12 }
 */
class Meta {
  /**
   * @param {object} options
   * @param {number} options.page        - Current page number (1-based)
   * @param {number} options.limit       - Items per page
   * @param {number} options.total       - Total number of items
   * @param {number} [options.totalPages] - Computed automatically if omitted
   */
  constructor({ page = 1, limit = 10, total = 0, totalPages } = {}) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = totalPages !== undefined
      ? totalPages
      : Math.ceil(total / limit);
  }
}

module.exports = Meta;
