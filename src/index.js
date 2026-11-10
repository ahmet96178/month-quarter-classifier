/**
 * Public entry point for the month-quarter-classifier library.
 *
 * The library exports a single factory function `createClassifier` that
 * returns a classifier object. The factory takes an options object with an
 * optional `fiscalYearStartMonth` (1-12, default 1 = January).
 *
 * We deliberately avoid default exports so that consumers can use named
 * imports, which are easier to statically analyse and tree-shake.
 */

import { createClassifier } from './core.js';

export { createClassifier };
