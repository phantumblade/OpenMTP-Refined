const assert = require('assert');
const {
  planPhotoBackup,
  planTotals,
} = require('../../app/helpers/photoBackupPlan');

function main() {
  const phoneFolders = [
    {
      dir: '/DCIM',
      files: [],
    },
    {
      dir: '/DCIM/Camera',
      files: [
        { name: 'a.jpg', path: '/DCIM/Camera/a.jpg', size: 10 },
        { name: 'b.jpg', path: '/DCIM/Camera/b.jpg', size: 20 },
        { name: 'c.mp4', path: '/DCIM/Camera/c.mp4', size: 300 },
      ],
    },
    {
      dir: '/DCIM/Screenshots',
      files: [{ name: 's.png', path: '/DCIM/Screenshots/s.png', size: 5 }],
    },
  ];
  const local = {
    '/Backup/Camera': new Map([
      ['a.jpg', 10], // already copied
      ['b.jpg', 999], // same name, other size: never overwritten
    ]),
    '/Backup/Screenshots': new Map([['s.png', 5]]),
  };
  const plan = planPhotoBackup({
    phoneFolders,
    destinationRoot: '/Backup',
    localFiles: (dir) => local[dir] || new Map(),
  });

  // only the folder with something new, mirrored under the destination
  assert.deepStrictEqual(
    plan.map(({ phoneDir, localDir, files }) => ({
      phoneDir,
      localDir,
      files,
    })),
    [
      {
        phoneDir: '/DCIM/Camera',
        localDir: '/Backup/Camera',
        files: ['/DCIM/Camera/c.mp4'],
      },
    ]
  );
  assert.strictEqual(plan[0].conflicts, 1);
  assert.deepStrictEqual(planTotals(plan), {
    files: 1,
    bytes: 300,
    conflicts: 1,
  });

  // a second run after everything was copied has nothing to do
  const copied = {
    '/Backup/Camera': new Map([
      ['a.jpg', 10],
      ['b.jpg', 20],
      ['c.mp4', 300],
    ]),
    '/Backup/Screenshots': new Map([['s.png', 5]]),
  };

  assert.deepStrictEqual(
    planPhotoBackup({
      phoneFolders,
      destinationRoot: '/Backup',
      localFiles: (dir) => copied[dir] || new Map(),
    }),
    []
  );

  // eslint-disable-next-line no-console
  console.log('Photo backup plan invariants: ok');
}

main();
