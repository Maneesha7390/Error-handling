'use strict';

/**
 * Represents pagination + search metadata attached to a success response.
 *
 * Core pagination fields (always present when page/limit/total supplied):
 *   - page         Current page number (1-based)
 *   - limit        Items per page
 *   - total        Total number of items across all pages
 *   - totalPages   Computed as Math.ceil(total / limit)
 *   - hasNext      true when page < totalPages
 *   - hasPrev      true when page > 1
 *   - nextPage     page + 1 when hasNext, otherwise null
 *   - prevPage     page - 1 when hasPrev, otherwise null
 *   - offset       (page - 1) * limit  (useful for DB LIMIT/OFFSET queries)
 *
 * Optional search / list fields (included only when provided):
 *   - query        The search query string the user submitted
 *   - sortBy       Field name used for sorting
 *   - sortOrder    'asc' | 'desc'
 *   - filters      Arbitrary object describing applied filters (e.g. { brand: 'Apple' })
 *
 * @example
 * new Meta({ query: 'iphone', page: 1, limit: 10, total: 125 });
 * // {
 * //   query: 'iphone', page: 1, limit: 10, total: 125,
 * //   totalPages: 13, hasNext: true, hasPrev: false,
 * //   nextPage: 2, prevPage: null, offset: 0
 * // }
 */
class Meta {
  /**
   * @param {object} options
   * @param {number} [options.page=1]        - Current page number (1-based)
   * @param {number} [options.limit=10]      - Items per page
   * @param {number} [options.total=0]       - Total number of items
   * @param {number} [options.totalPages]    - Override computed totalPages
   * @param {boolean}[options.hasNext]       - Override computed hasNext
   * @param {boolean}[options.hasPrev]       - Override computed hasPrev
   * @param {string} [options.query]         - Original search query
   * @param {string} [options.sortBy]        - Sort field
   * @param {('asc'|'desc')} [options.sortOrder] - Sort direction
   * @param {object} [options.filters]       - Applied filters
   */
  constructor(options = {}) {
    const {
      page = 1,
      limit = 10,
      total = 0,
      totalPages,
      hasNext,
      hasPrev,
      query,
      sortBy,
      sortOrder,
      filters,
    } = options;

    const safePage = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const safeLimit = Number.isFinite(+limit) && +limit > 0 ? +limit : 10;
    const safeTotal = Number.isFinite(+total) && +total >= 0 ? +total : 0;

    const computedTotalPages =
      totalPages !== undefined
        ? +totalPages
        : safeLimit > 0
          ? Math.ceil(safeTotal / safeLimit)
          : 0;

    if (query !== undefined) this.query = query;

    this.page = safePage;
    this.limit = safeLimit;
    this.total = safeTotal;
    this.totalPages = computedTotalPages;

    this.hasNext = hasNext !== undefined ? !!hasNext : safePage < computedTotalPages;
    this.hasPrev = hasPrev !== undefined ? !!hasPrev : safePage > 1;
    this.nextPage = this.hasNext ? safePage + 1 : null;
    this.prevPage = this.hasPrev ? safePage - 1 : null;
    this.offset = (safePage - 1) * safeLimit;

    if (sortBy !== undefined) this.sortBy = sortBy;
    if (sortOrder !== undefined) this.sortOrder = sortOrder;
    if (filters !== undefined && filters !== null) this.filters = filters;
  }
}

module.exports = Meta;
