const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { escapeShellMtp } = require('../../app/helpers/mtpCliShell');

// what mtp-cli receives once /bin/sh has unquoted `"lsext \"<path>\""`
const throughShell = (filePath) =>
  execFileSync('/bin/sh', [
    '-c',
    `printf '%s' "lsext \\"${escapeShellMtp(filePath)}\\""`,
  ]).toString();

function main() {
  const marker = path.join(os.tmpdir(), `openmtp-injected-${process.pid}`);

  // phone file names are untrusted: none of them may run a command on the Mac
  [
    `/DCIM/$(touch ${marker}).jpg`,
    `/DCIM/\`touch ${marker}\`.jpg`,
    `/DCIM/$(touch ${marker})\\"mixed`,
    '/Download/$HOME',
    // eslint-disable-next-line no-template-curly-in-string
    '/Download/${PATH}',
    '/Download/price$',
  ].forEach((filePath) => {
    throughShell(filePath);
    assert.ok(!fs.existsSync(marker), filePath);
  });

  // ... and they reach mtp-cli literally
  [
    '/DCIM/$(echo pwned).jpg',
    '/Download/$HOME',
    // eslint-disable-next-line no-template-curly-in-string
    '/Download/${PATH}',
    '/Download/price$',
    '/DCIM/Camera/IMG 0001.jpg',
  ].forEach((filePath) => {
    assert.strictEqual(throughShell(filePath), `lsext "${filePath}"`);
  });

  // quotes and backticks keep the escaping mtp-cli itself undoes
  assert.strictEqual(throughShell('/a"b'), 'lsext "/a\\"b"');
  assert.strictEqual(throughShell('/a`b'), 'lsext "/a\\`b"');

  // eslint-disable-next-line no-console
  console.log('MTP CLI shell escaping invariants: ok');
}

main();
