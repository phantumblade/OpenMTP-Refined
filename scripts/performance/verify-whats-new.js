const assert = require('assert');
const semver = require('semver');
const { translate } = require('../../app/i18n');
const {
  WHATS_NEW_ITEMS,
  selectWhatsNew,
  whatsNewLayout,
} = require('../../app/containers/Onboarding/whatsNewItems');

// written the same in Italian
const SAME_IN_ITALIAN = new Set(['Material 3 Expressive']);

const titles = (list) => list.map((item) => item.title);

function main() {
  // from 4.1.0 to 4.1.1: only the 4.1.1 change, alone as the featured card
  const patch = selectWhatsNew({ from: '4.1.0', to: '4.1.1' });

  assert.strictEqual(patch.mode, 'update');
  assert.strictEqual(patch.count, 1);
  assert.strictEqual(patch.featured.since, '4.1.1');
  assert.deepStrictEqual(patch.cards, []);
  assert.deepStrictEqual(patch.chips, []);
  assert.strictEqual(patch.multipleVersions, false);

  // from 4.0.0: everything of 4.1.0 and 4.1.1, the most important first,
  // nothing from 4.0.0 itself
  const minor = selectWhatsNew({ from: '4.0.0', to: '4.1.1' });

  assert.strictEqual(minor.featured.title, 'Photo backup in one click');
  assert.strictEqual(minor.cards.length, 4);
  assert.ok(minor.multipleVersions);
  [minor.featured, ...minor.cards, ...minor.chips].forEach((item) => {
    assert.ok(['4.1.0', '4.1.1'].includes(item.since), item.title);
  });
  assert.strictEqual(
    minor.count,
    WHATS_NEW_ITEMS.filter(
      (item) =>
        semver.gt(item.since, '4.0.0') && semver.lte(item.since, '4.1.1')
    ).length
  );
  const weights = [minor.featured, ...minor.cards].map((item) => item.weight);

  assert.deepStrictEqual(
    weights,
    [...weights].sort((a, b) => b - a)
  );

  // from 4.1.1 to 4.1.2: the 4.1.2 change only
  const next = selectWhatsNew({ from: '4.1.1', to: '4.1.2' });

  assert.strictEqual(next.count, 1);
  assert.strictEqual(next.featured.since, '4.1.2');

  // from 4.1.2 to 4.1.3: the 4.1.3 change only
  const latest = selectWhatsNew({ from: '4.1.2', to: '4.1.3' });

  assert.strictEqual(latest.count, 1);
  assert.strictEqual(latest.featured.since, '4.1.3');

  // first install: a welcome with the best of every version
  const welcome = selectWhatsNew({ from: null, to: '4.1.1' });

  assert.strictEqual(welcome.mode, 'welcome');
  assert.ok(titles(welcome.cards).includes('A connection that just works'));

  // same version, or a future item not shipped yet: nothing to show
  assert.strictEqual(
    selectWhatsNew({ from: '4.1.1', to: '4.1.1' }).featured,
    null
  );
  assert.strictEqual(
    selectWhatsNew({
      from: '4.1.1',
      to: '4.1.1',
      items: [{ ...WHATS_NEW_ITEMS[0], since: '4.2.0' }],
    }).featured,
    null
  );

  // every grid row is full in a wide window
  [0, 1, 2, 3, 4].forEach((cards) => {
    const { columns, featuredSpan } = whatsNewLayout(cards);
    const cells = featuredSpan + cards;

    assert.strictEqual(cells % columns, 0, `${cards} cards`);
  });

  // every text has an Italian translation
  const missing = WHATS_NEW_ITEMS.flatMap((item) =>
    [item.title, item.chip, item.description].filter(
      (text) => !SAME_IN_ITALIAN.has(text) && translate('it', text) === text
    )
  );

  assert.deepStrictEqual(missing, [], 'untranslated What’s new texts');

  // eslint-disable-next-line no-console
  console.log("What's new selection invariants: ok");
}

main();
