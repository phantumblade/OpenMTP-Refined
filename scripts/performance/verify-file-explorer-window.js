const assert = require('assert');
const { performance } = require('perf_hooks');
const {
  calculateGridWindow,
  calculateListWindow,
} = require('../../app/utils/virtualWindow');

const ITEM_COUNTS = [0, 100, 1000, 10000, 50000];
const ITERATIONS = 100000;

ITEM_COUNTS.forEach((itemCount) => {
  for (let scrollOffset = 0; scrollOffset < 200000; scrollOffset += 7919) {
    const listWindow = calculateListWindow({
      itemCount,
      scrollOffset,
      viewportSize: 800,
      itemSize: 40,
      overscan: 8,
    });
    const gridWindow = calculateGridWindow({
      itemCount,
      scrollOffset,
      viewportSize: 800,
      containerSize: 590,
      itemWidth: 118,
      itemHeight: 155,
      overscanRows: 3,
    });

    [listWindow, gridWindow].forEach(({ startIndex, endIndex }) => {
      assert(startIndex >= 0);
      assert(startIndex <= endIndex);
      assert(endIndex <= itemCount);
    });
  }
});

const benchmarkStart = performance.now();

for (let index = 0; index < ITERATIONS; index += 1) {
  calculateGridWindow({
    itemCount: 50000,
    scrollOffset: (index * 173) % 1500000,
    viewportSize: 800,
    containerSize: 590,
    itemWidth: 118,
    itemHeight: 155,
    overscanRows: 3,
  });
}

const duration = performance.now() - benchmarkStart;

console.info(
  `Virtual window: ${ITERATIONS} calculations in ${duration.toFixed(2)} ms`
);
console.info('Virtual window invariants: ok');
