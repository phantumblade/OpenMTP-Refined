const assert = require('assert');
const os = require('os');
const path = require('path');
const {
  FOLDER_ACCESS,
  folderAccessStatus,
  isPermissionError,
  protectedFolderFor,
} = require('../../app/helpers/folderAccess');
const {
  formatStorageSize,
  parseDfOutput,
  volumeNameFor,
} = require('../../app/helpers/diskSpace');

function main() {
  const home = os.homedir();
  const id = (filePath) => protectedFolderFor(filePath, 'Macintosh HD')?.id;

  assert.strictEqual(id(path.join(home, 'Desktop')), 'desktop');
  assert.strictEqual(id(path.join(home, 'Desktop/Trip/a.jpg')), 'desktop');
  assert.strictEqual(id(path.join(home, 'Documents')), 'documents');
  assert.strictEqual(id(path.join(home, 'Downloads/x')), 'downloads');
  // look-alike names and ordinary folders are not protected
  assert.strictEqual(id(path.join(home, 'Desktop copy')), undefined);
  assert.strictEqual(id(path.join(home, 'Pictures')), undefined);
  assert.strictEqual(id(home), undefined);
  // external disks, but not /Volumes itself or the startup disk link
  assert.strictEqual(id('/Volumes/SSD_2TB/Projects'), 'volumes');
  assert.strictEqual(id('/Volumes'), undefined);
  assert.strictEqual(id('/Volumes/Macintosh HD/Users'), undefined);

  assert.strictEqual(folderAccessStatus({}, 'desktop'), FOLDER_ACCESS.ask);
  assert.strictEqual(
    folderAccessStatus({ desktop: 'blocked' }, 'desktop'),
    FOLDER_ACCESS.blocked
  );

  assert.ok(isPermissionError({ code: 'EPERM' }));
  assert.ok(isPermissionError('Error: EACCES: permission denied, scandir'));
  assert.ok(!isPermissionError({ code: 'ENOENT' }));

  const df = parseDfOutput(
    'Filesystem 1024-blocks Used Available Capacity iused ifree %iused  Mounted on\n' +
      '/dev/disk5s1 1953513540 464395772 1488824932 24% 348063 14888249320 0% /Volumes/My Disk'
  );

  assert.deepStrictEqual(df, {
    totalBytes: 1953513540 * 1024,
    freeBytes: 1488824932 * 1024,
    mountPoint: '/Volumes/My Disk',
  });
  assert.strictEqual(parseDfOutput('garbage'), null);

  // Finder-style sizes and names
  assert.strictEqual(formatStorageSize(482797652 * 1024, 'it'), '494,4 GB');
  assert.strictEqual(formatStorageSize(12.8e9, 'en'), '12.8 GB');
  assert.strictEqual(volumeNameFor('/Volumes/My Disk'), 'My Disk');
  assert.notStrictEqual(volumeNameFor('/System/Volumes/Data'), 'Data');

  // eslint-disable-next-line no-console
  console.log('Folder access invariants: ok');
}

main();
