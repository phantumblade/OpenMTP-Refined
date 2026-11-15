const assert = require('assert');
const {
  clearIncomingTransfer,
  getIncomingTransfer,
  incomingItemState,
  setIncomingTransfer,
  subscribeIncomingTransfer,
} = require('../../app/helpers/incomingTransfer');

function main() {
  const items = [
    { path: '/DCIM/Camera', name: 'Camera', isFolder: true },
    { path: '/Download/a.jpg', name: 'a.jpg', isFolder: false },
    { path: '/Download/b.mp4', name: 'b.mp4', isFolder: false },
  ];
  const at = (index, progress, done = false) =>
    incomingItemState({ index, items, progress, done });

  // nothing copied yet: everything waits
  assert.deepStrictEqual(at(0, { currentFile: null }), {
    status: 'waiting',
    value: 0,
  });

  // a file inside the first (folder) item: it spins, the others wait
  const inFolder = { currentFile: '/DCIM/Camera/2026/x.jpg' };

  assert.deepStrictEqual(at(0, inFolder), { status: 'active', value: null });
  assert.strictEqual(at(1, inFolder).status, 'waiting');

  // the second item: the first is done, the second shows its own progress
  const second = { currentFile: '/Download/a.jpg', activeFileProgress: 46.5 };

  assert.strictEqual(at(0, second).status, 'done');
  assert.deepStrictEqual(at(1, second), { status: 'active', value: 46.5 });
  assert.strictEqual(at(2, second).status, 'waiting');

  // a sibling sharing the prefix doesn't count as inside the folder
  assert.strictEqual(
    at(0, { currentFile: '/DCIM/Camera copy/x.jpg' }).status,
    'waiting'
  );

  // the copy ended
  assert.strictEqual(at(2, second, true).status, 'done');

  // the store
  const seen = [];
  const unsubscribe = subscribeIncomingTransfer((value) => seen.push(value));

  setIncomingTransfer({
    sessionId: 's1',
    destinationDeviceType: 'local',
    destinationFolder: '/x',
    items,
  });
  assert.strictEqual(getIncomingTransfer().sessionId, 's1');
  clearIncomingTransfer('other');
  assert.ok(getIncomingTransfer());
  clearIncomingTransfer('s1');
  assert.strictEqual(getIncomingTransfer(), null);
  assert.strictEqual(seen.length, 2);
  unsubscribe();

  // eslint-disable-next-line no-console
  console.log('Incoming transfer invariants: ok');
}

main();
