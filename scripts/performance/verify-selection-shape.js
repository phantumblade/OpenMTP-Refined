/* eslint-disable no-bitwise */
const assert = require('assert');
const {
  CORNER,
  cornerRadiusVars,
  joinedCorners,
} = require('../../app/helpers/selectionShape');

const corners = (selected, columns, count) =>
  Array.from({ length: count }, (_, index) =>
    joinedCorners({
      index,
      columns,
      count,
      isSelectedAt: (i) => selected.includes(i),
    })
  );

function main() {
  const { tl, tr, br, bl } = CORNER;

  // a lone tile keeps four round corners
  assert.deepStrictEqual(corners([4], 4, 12)[4], 0);
  // not selected: nothing joined
  assert.strictEqual(corners([4], 4, 12)[3], 0);

  // a row of three: the outer ends stay round
  const row = corners([1, 2, 3], 4, 12);

  assert.strictEqual(row[1], tr | br);
  assert.strictEqual(row[2], tl | tr | br | bl);
  assert.strictEqual(row[3], tl | bl);

  // the end of a row doesn't join the start of the next one
  const wrap = corners([3, 4], 4, 12);

  assert.strictEqual(wrap[3], 0);
  assert.strictEqual(wrap[4], 0);

  // a block over two rows (like the screenshot): 1 2 3 / 6 7
  const block = corners([1, 2, 3, 6, 7], 4, 12);

  assert.strictEqual(block[1], tr | br);
  assert.strictEqual(block[2], tl | tr | br | bl);
  assert.strictEqual(block[3], tl | bl | br);
  assert.strictEqual(block[6], tl | tr | br);
  assert.strictEqual(block[7], tl | tr | bl);

  // a short last row: nothing below the end of the list
  assert.strictEqual(corners([9, 10], 4, 11)[9], tr | br);

  // CSS variables
  assert.deepStrictEqual(cornerRadiusVars(tl | br, 28, 8), {
    '--sel-tl': '8px',
    '--sel-tr': '28px',
    '--sel-br': '8px',
    '--sel-bl': '28px',
  });

  // eslint-disable-next-line no-console
  console.log('Connected selection invariants: ok');
}

main();
