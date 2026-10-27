const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  MTP_CLI_ARGS,
  escapeShellMtp,
} = require('../../app/helpers/mtpCliArgs');

const e = escapeShellMtp;

// the arguments /bin/sh made of the command lines mtp-cli used to get
const argvThroughShell = (commandLine) =>
  execFileSync('/bin/sh', ['-c', `printf '%s\\0' ${commandLine}`], {
    stdio: 'pipe',
  })
    .toString()
    .split('\0')
    .slice(0, -1);

const OLD_COMMAND_LINES = {
  properties: (id, p) => `"storage ${id}" "properties \\"${e(p)}\\""`,
  listFiles: (id, p) => `"storage ${id}" "lsext \\"${e(p)}\\""`,
  rename: (id, p, n) => `"storage ${id}" "rename \\"${e(p)}\\" \\"${e(n)}\\""`,
  remove: (id, p) => `"storage ${id}" "rm \\"${e(p)}\\""`,
  makeDirectory: (id, p) => `"storage ${id}" "mkpath \\"${e(p)}\\""`,
  download: (id, s, d) =>
    `-e "storage ${id}" "get \\"${e(s)}\\" \\"${e(d)}\\""`,
  upload: (id, s, d) => `-e "storage ${id}" "put \\"${e(s)}\\" \\"${e(d)}\\""`,
};

// names the old shell command lines handled correctly
const SAFE_NAMES = [
  '/DCIM/Camera/IMG 0001.jpg',
  '/a"b',
  '/a\\"b',
  '/a"\\b',
  '/a"\\"b',
  '/a\\b',
  '/a\\\\b',
  '/a`b',
  '/price$',
  '/$(echo pwned)',
  "/it's here",
  '/tab\there',
  '/line\nbreak',
  '/émoji 📷',
  '/!bang',
  '/*.jpg',
  '/{a,b}',
];

function verifySameArgumentsAsBefore() {
  SAFE_NAMES.forEach((name) => {
    Object.entries(OLD_COMMAND_LINES).forEach(([command, oldLine]) => {
      const args = [65537, name, `${name}.copy`];

      assert.deepStrictEqual(
        MTP_CLI_ARGS[command](...args),
        argvThroughShell(oldLine(...args)),
        `${command} ${JSON.stringify(name)}`
      );
    });
  });

  assert.deepStrictEqual(MTP_CLI_ARGS.storageList(), ['storage-list']);
  assert.deepStrictEqual(MTP_CLI_ARGS.debugReport(), ['pwd', '-v']);
}

function verifyNamesAreNeverRun() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openmtp-mtpcli-'));
  const marker = path.join(dir, 'ran');
  const received = path.join(dir, 'argv');
  const fakeMtpCli = path.join(dir, 'mtp-cli');

  fs.writeFileSync(
    fakeMtpCli,
    `#!/bin/sh\nprintf '%s\\0' "$@" > "${received}"\n`,
    {
      mode: 0o755,
    }
  );

  try {
    [
      `/DCIM/a\\$(touch ${marker}).jpg`,
      `/DCIM/a\\\`touch ${marker}\`.jpg`,
      `/DCIM/$(touch ${marker}).jpg`,
      `/DCIM/\`touch ${marker}\`.jpg`,
    ].forEach((name) => {
      const args = MTP_CLI_ARGS.listFiles(1, name);

      // what the data source does: mtp-cli with arguments, no shell
      execFileSync(fakeMtpCli, args);

      assert.ok(!fs.existsSync(marker), `ran a command: ${name}`);
      assert.deepStrictEqual(
        fs.readFileSync(received, 'utf8').split('\0').slice(0, -1),
        args
      );
      assert.ok(args[1].includes('touch'), name);
    });

    // the old shell command line did run the first one
    try {
      argvThroughShell(
        OLD_COMMAND_LINES.listFiles(1, `/DCIM/a\\$(touch ${marker}).jpg`)
      );
    } catch (_) {
      // a syntax error doesn't matter, the command already ran
    }

    assert.ok(fs.existsSync(marker), 'the old command line was not unsafe');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function verifyNoShell() {
  const source = fs.readFileSync(
    path.join(
      __dirname,
      '../../app/data/file-explorer/data-sources/FileExplorerLegacyDataSource.js'
    ),
    'utf8'
  );

  assert.ok(!/\bexec\s*\(\s*command|import \{[^}]*\bexec\b/.test(source));
  assert.ok(!/shell:\s*true/.test(source));
  assert.ok(/execFile\(mtpCliPath, args/.test(source));
  assert.ok(/spawn\(mtpCliPath, cmdArgs\)/.test(source));
}

function main() {
  verifySameArgumentsAsBefore();
  verifyNamesAreNeverRun();
  verifyNoShell();

  // eslint-disable-next-line no-console
  console.log('MTP CLI argument invariants: ok');
}

main();
