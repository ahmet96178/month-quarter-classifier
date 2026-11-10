/**
 * Core implementation of the month-quarter-classifier.
 *
 * A classifier is parameterised by the month in which the fiscal year
 * starts. All arithmetic is done on a 1-based month index and a 0-based
 * "months since fiscal year start" offset so that the quarter and half-year
 * boundaries are simple integer divisions.
 *
 * The classifier is intentionally stateless apart from its configuration;
 * it never reads the system clock. This makes it trivially testable and
 * safe to share between requests.
 */

/**
 * Return the quarter (1-4) and half-year (1-2) for a given date.
 *
 * @param {Date} date - A JavaScript Date. Only the UTC month is used, so
 *   callers should construct dates in UTC (e.g. `new Date(Date.UTC(...))`)
 *   to avoid timezone surprises. We document this rather than silently
 *   normalising, because silently changing the caller's date is worse than
 *   asking them to be explicit.
 * @param {number} fiscalYearStartMonth - 1-based month (1 = January).
 * @returns {{ quarter: number, half: number, fiscalMonth: number }}
 */
export function classify(date, fiscalYearStartMonth) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('date must be a valid Date');
  }
  if (
    !Number.isInteger(fiscalYearStartMonth) ||
    fiscalYearStartMonth < 1 ||
    fiscalYearStartMonth > 12
  ) {
    throw new RangeError('fiscalYearStartMonth must be an integer between 1 and 12');
  }

  const calendarMonth = date.getUTCMonth() + 1; // 1-12
  // Offset from the fiscal year start, in months, 0-11.
  const fiscalMonth =
    (calendarMonth - fiscalYearStartMonth + 12) % 12;

  const quarter = Math.floor(fiscalMonth / 3) + 1;
  const half = Math.floor(fiscalMonth / 6) + 1;

  return { quarter, half, fiscalMonth };
}

/**
 * Create a classifier bound to a specific fiscal year start month.
 *
 * @param {object} [options]
 * @param {number} [options.fiscalYearStartMonth=1] - 1-based month.
 * @returns {{ classify: (date: Date) => { quarter: number, half: number, fiscalMonth: number } }}
 */
export function createClassifier(options = {}) {
  const { fiscalYearStartMonth = 1 } = options;

  if (
    !Number.isInteger(fiscalYearStartMonth) ||
    fiscalYearStartMonth < 1 ||
    fiscalYearStartMonth > 12
  ) {
    throw new RangeError('fiscalYearStartMonth must be an integer between 1 and 12');
  }

  return {
    classify(date) {
      return classify(date, fiscalYearStartMonth);
    },
  };
}
