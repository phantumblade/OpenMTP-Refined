const assert = require('assert');
const {
  datePlaceholder,
  formatDisplayDate,
  monthMatrix,
  parseDisplayDate,
  quickRanges,
  weekStartsOn,
} = require('../../app/helpers/dateLocale');

function main() {
  // Italian: day / month / year, week starts on Monday
  assert.strictEqual(formatDisplayDate('2026-09-03', 'it'), '03/09/2026');
  assert.strictEqual(parseDisplayDate('03/09/2026', 'it'), '2026-09-03');
  assert.strictEqual(parseDisplayDate('3.9.2026', 'it'), '2026-09-03');
  assert.strictEqual(datePlaceholder('it'), 'gg/mm/aaaa');
  assert.strictEqual(weekStartsOn('it'), 1);

  // English: month / day / year, week starts on Sunday
  assert.strictEqual(formatDisplayDate('2026-09-03', 'en'), '09/03/2026');
  assert.strictEqual(parseDisplayDate('09/03/2026', 'en'), '2026-09-03');
  assert.strictEqual(weekStartsOn('en'), 0);

  // empty vs invalid input
  assert.strictEqual(parseDisplayDate('', 'it'), '');
  assert.strictEqual(parseDisplayDate('31/02/2026', 'it'), null);
  assert.strictEqual(parseDisplayDate('ciao', 'it'), null);
  assert.strictEqual(formatDisplayDate('', 'it'), '');

  const ranges = quickRanges(new Date(2026, 8, 29));

  assert.deepStrictEqual(ranges.today, {
    from: '2026-09-29',
    to: '2026-09-29',
  });
  assert.deepStrictEqual(ranges.last7Days, {
    from: '2026-09-23',
    to: '2026-09-29',
  });
  assert.strictEqual(ranges.thisYear.from, '2026-01-01');

  // September 2026 starts on a Tuesday: Monday-first grid begins on 31 Aug
  const it = monthMatrix(2026, 8, 1);

  assert.strictEqual(it.length, 42);
  assert.strictEqual(it[0].getDate(), 31);
  assert.strictEqual(it[0].getDay(), 1);
  assert.strictEqual(monthMatrix(2026, 8, 0)[0].getDay(), 0);

  // eslint-disable-next-line no-console
  console.log('Date locale invariants: ok');
}

main();
