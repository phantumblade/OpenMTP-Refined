const assert = require('assert');
const {
  SPRING_END_MS,
  frameAt,
  getMorphSequence,
  springValue,
} = require('../../app/components/m3/M3LoadingIndicator');

function main() {
  // Compose: spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1)
  assert.ok(Math.abs(SPRING_END_MS - 298) < 2, `spring end ${SPRING_END_MS}`);
  assert.strictEqual(springValue(0), 0);
  // underdamped: overshoots ~9.5% before settling
  const peak = Math.max(
    ...Array.from({ length: 300 }, (_, i) => springValue(i / 1000))
  );

  assert.ok(peak > 1.08 && peak < 1.11, `peak ${peak}`);

  const { morphs, scaleFactor } = getMorphSequence();

  assert.strictEqual(morphs.length, 7);
  assert.ok(scaleFactor > 0.6 && scaleFactor < 0.8, `scale ${scaleFactor}`);

  let previous = frameAt(0, morphs.length, true);

  assert.strictEqual(previous.morphIndex, 0);

  for (let ms = 1; ms < 20000; ms += 7) {
    const frame = frameAt(ms, morphs.length, true);

    assert.ok(
      Number.isInteger(frame.morphIndex) &&
        frame.morphIndex >= 0 &&
        frame.morphIndex < morphs.length,
      `bad morph index at ${ms}ms`
    );
    // rendering every frame must work
    assert.ok(morphs[frame.morphIndex].asCubics(frame.progress).length > 0);

    // rotation is continuous: forward, or back by less than 1deg while the
    // underdamped spring settles (no snap when a morph hands over)
    const delta = (((frame.rotation - previous.rotation) % 360) + 360) % 360;

    assert.ok(delta < 45 || delta > 359, `rotation jump ${delta} at ${ms}ms`);
    previous = frame;
  }

  // at each hand-over the finished morph is within 1% of the next shape
  const { morphIndex: lastIndex, progress: lastProgress } = frameAt(
    649.9,
    morphs.length,
    true
  );

  assert.strictEqual(lastIndex, 0);
  assert.ok(Math.abs(lastProgress - 1) < 0.01, `hand-over ${lastProgress}`);

  // eslint-disable-next-line no-console
  console.log('M3 loading indicator invariants: ok');
}

main();
