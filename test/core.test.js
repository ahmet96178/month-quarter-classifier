import test from 'node:test';
import assert from 'node:assert/strict';

import { createClassifier } from '../src/index.js';
import { classify } from '../src/core.js';

/**
 * Helper to build a UTC date so tests are independent of the host timezone.
 */
function utcDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

test('calendar year: January is Q1 H1', () => {
  const c = createClassifier();
  assert.deepEqual(c.classify(utcDate(2024, 1, 15)), {
    quarter: 1,
    half: 1,
    fiscalMonth: 0,
  });
});

test('calendar year: December is Q4 H2', () => {
  const c = createClassifier();
  assert.deepEqual(c.classify(utcDate(2024, 12, 31)), {
    quarter: 4,
    half: 2,
    fiscalMonth: 11,
  });
});

test('calendar year: quarter boundaries', () => {
  const c = createClassifier();
  assert.equal(c.classify(utcDate(2024, 3, 31)).quarter, 1);
  assert.equal(c.classify(utcDate(2024, 4, 1)).quarter, 2);
  assert.equal(c.classify(utcDate(2024, 6, 30)).quarter, 2);
  assert.equal(c.classify(utcDate(2024, 7, 1)).quarter, 3);
  assert.equal(c.classify(utcDate(2024, 9, 30)).quarter, 3);
  assert.equal(c.classify(utcDate(2024, 10, 1)).quarter, 4);
});

test('calendar year: half-year boundaries', () => {
  const c = createClassifier();
  assert.equal(c.classify(utcDate(2024, 6, 30)).half, 1);
  assert.equal(c.classify(utcDate(2024, 7, 1)).half, 2);
});

test('fiscal year starting in July: July is Q1 H1', () => {
  const c = createClassifier({ fiscalYearStartMonth: 7 });
  assert.deepEqual(c.classify(utcDate(2024, 7, 1)), {
    quarter: 1,
    half: 1,
    fiscalMonth: 0,
  });
});

test('fiscal year starting in July: December is Q2 H1', () => {
  const c = createClassifier({ fiscalYearStartMonth: 7 });
  assert.deepEqual(c.classify(utcDate(2024, 12, 31)), {
    quarter: 2,
    half: 1,
    fiscalMonth: 5,
  });
});

test('fiscal year starting in July: January is Q3 H2', () => {
  const c = createClassifier({ fiscalYearStartMonth: 7 });
  assert.deepEqual(c.classify(utcDate(2025, 1, 1)), {
    quarter: 3,
    half: 2,
    fiscalMonth: 6,
  });
});

test('fiscal year starting in July: June is Q4 H2', () => {
  const c = createClassifier({ fiscalYearStartMonth: 7 });
  assert.deepEqual(c.classify(utcDate(2025, 6, 30)), {
    quarter: 4,
    half: 2,
    fiscalMonth: 11,
  });
});

test('fiscal year starting in October', () => {
  const c = createClassifier({ fiscalYearStartMonth: 10 });
  assert.equal(c.classify(utcDate(2024, 10, 1)).quarter, 1);
  assert.equal(c.classify(utcDate(2024, 12, 31)).quarter, 1);
  assert.equal(c.classify(utcDate(2025, 1, 1)).quarter, 2);
  assert.equal(c.classify(utcDate(2025, 3, 31)).quarter, 2);
  assert.equal(c.classify(utcDate(2025, 4, 1)).quarter, 3);
  assert.equal(c.classify(utcDate(2025, 6, 30)).quarter, 3);
  assert.equal(c.classify(utcDate(2025, 7, 1)).quarter, 4);
  assert.equal(c.classify(utcDate(2025, 9, 30)).quarter, 4);
});

test('fiscalMonth is zero-based offset from fiscal start', () => {
  const c = createClassifier({ fiscalYearStartMonth: 4 });
  assert.equal(c.classify(utcDate(2024, 4, 1)).fiscalMonth, 0);
  assert.equal(c.classify(utcDate(2024, 5, 1)).fiscalMonth, 1);
  assert.equal(c.classify(utcDate(2024, 3, 1)).fiscalMonth, 11);
});

test('invalid fiscalYearStartMonth throws RangeError', () => {
  assert.throws(() => createClassifier({ fiscalYearStartMonth: 0 }), RangeError);
  assert.throws(() => createClassifier({ fiscalYearStartMonth: 13 }), RangeError);
  assert.throws(() => createClassifier({ fiscalYearStartMonth: 1.5 }), RangeError);
  assert.throws(() => createClassifier({ fiscalYearStartMonth: '6' }), RangeError);
});

test('invalid date throws TypeError', () => {
  assert.throws(() => classify(new Date('not a date'), 1), TypeError);
  assert.throws(() => classify(null, 1), TypeError);
  assert.throws(() => classify('2024-01-01', 1), TypeError);
});

test('classify function is exported and works directly', () => {
  assert.deepEqual(classify(utcDate(2024, 1, 1), 1), {
    quarter: 1,
    half: 1,
    fiscalMonth: 0,
  });
  assert.deepEqual(classify(utcDate(2024, 1, 1), 7), {
    quarter: 3,
    half: 2,
    fiscalMonth: 6,
  });
});
