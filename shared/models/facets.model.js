'use strict';

/**
 * Normalises a "facets" payload for aggregated search results.
 *
 * A facet describes how many items match a given attribute value, e.g.
 *
 *   {
 *     brand:    [ { name: 'Apple',  count: 40 }, { name: 'Samsung', count: 30 } ],
 *     category: [ { name: 'Phones', count: 80 } ],
 *     priceRange: [ { name: '0-500', count: 50 }, { name: '500-1000', count: 30 } ]
 *   }
 *
 * This class is a thin, forgiving wrapper:
 *   - Accepts any object whose values are arrays of facet buckets.
 *   - Each bucket may use `name` or `value` for the label, and `count` for the amount.
 *   - Invalid / non-array facet values are silently dropped so the response never breaks.
 *   - Bucket `count` is coerced to a non-negative integer; missing counts default to 0.
 *   - Preserves any extra bucket properties (e.g. `selected: true`) untouched.
 *
 * @example
 * new Facets({ brand: [{ name: 'Apple', count: '40' }] });
 * // => { brand: [{ name: 'Apple', count: 40 }] }
 */
class Facets {
  /**
   * @param {object} [raw={}] - The raw facets payload to normalise.
   */
  constructor(raw = {}) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      return;
    }

    for (const [key, buckets] of Object.entries(raw)) {
      if (!Array.isArray(buckets)) continue;

      const cleaned = buckets
        .filter((b) => b != null && typeof b === 'object')
        .map((b) => {
          const label = b.name !== undefined ? b.name : b.value;
          const rawCount = Number(b.count);
          const count = Number.isFinite(rawCount) && rawCount >= 0 ? Math.trunc(rawCount) : 0;

          return {
            ...b,
            ...(label !== undefined ? { name: label } : {}),
            count,
          };
        });

      this[key] = cleaned;
    }
  }
}

module.exports = Facets;
