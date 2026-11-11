# month-quarter-classifier

Returns the calendar quarter and half-year period for a given date, with a
configurable fiscal year start month.

```js
import { createClassifier } from './src/index.js';

const classifier = createClassifier({ fiscalYearStartMonth: 7 });

const result = classifier.classify(new Date(Date.UTC(2025, 0, 15)));
// { quarter: 3, half: 2, fiscalMonth: 6 }
```

## Why this exists

Dates carry a calendar month, but finance and reporting teams usually think in
fiscal quarters and halves that start on an arbitrary month. The obvious
implementation — `Math.floor((month - start) / 3) + 1` — breaks as soon as the
fiscal year wraps around the end of the calendar year, because JavaScript's
month index is 1-based and does not wrap. This library does the wrap once, in
one place, and exposes the result as a small, dependency-free object.

The trade-off: the classifier is stateless and takes no clock. If you want
"today's quarter" you pass `new Date()` yourself. That keeps the library
deterministic and makes it trivial to test against fixed dates.

## API

### `createClassifier(options?)`

Returns a classifier object.

- `options.fiscalYearStartMonth` — integer 1–12, default `1` (January).
  Throws `RangeError` if not an integer in that range.

### `classifier.classify(date)`

Returns `{ quarter, half, fiscalMonth }`:

- `quarter` — 1–4, where 1 is the first three months of the fiscal year.
- `half` — 1–2, where 1 is the first six months of the fiscal year.
- `fiscalMonth` — 0–11, months elapsed since the fiscal year start.

Throws `TypeError` if `date` is not a valid `Date`.

### `classify(date, fiscalYearStartMonth)`

A direct function export for callers who prefer not to create a classifier.
Same behaviour and validation as the method above.

## The awkward edge

`Date` carries a timezone. This library reads `getUTCMonth()`, so a date
constructed in a local timezone near a month boundary can land in a different
fiscal quarter than the caller expects. Construct dates with `Date.UTC(...)`
when the calendar month matters. The library does not silently convert, because
guessing the caller's intended timezone is worse than requiring them to be
explicit.
