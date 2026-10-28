const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { translate } = require('../../app/i18n');

const APP_DIR = path.join(__dirname, '../../app');

// written the same in Italian
const SAME_IN_ITALIAN = new Set([
  'Menu',
  'No',
  'Privacy',
  'Repository',
  'Standard',
]);

const sourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return ['dist', 'i18n', 'node_modules'].includes(entry.name)
        ? []
        : sourceFiles(fullPath);
    }

    return /\.jsx?$/.test(entry.name) && !/\.prod\.js$/.test(entry.name)
      ? [fullPath]
      : [];
  });

function main() {
  const untranslated = new Map();
  let checked = 0;

  sourceFiles(APP_DIR).forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');

    // t('…') and tr('…'), the helpers every user-facing string goes through
    for (const match of source.matchAll(
      /\b(?:t|tr)\(\s*(['"])((?:(?!\1)[^\\]|\\.)+)\1/g
    )) {
      const key = match[2].replace(/\\(['"])/g, '$1');

      checked += 1;

      if (translate('it', key) === key && !SAME_IN_ITALIAN.has(key)) {
        untranslated.set(key, path.relative(APP_DIR, file));
      }
    }
  });

  assert.ok(checked > 100, `only ${checked} strings found`);
  assert.deepStrictEqual(
    [...untranslated].map(([key, file]) => `${key} (${file})`),
    [],
    'strings without an Italian translation'
  );

  // eslint-disable-next-line no-console
  console.log('Italian translation coverage invariants: ok');
}

main();
