const assert = require('assert');
const {
  isAppPageUrl,
  isExternalUrl,
  navigationDecision,
} = require('../../app/helpers/navigationPolicy');

function main() {
  const appUrl =
    'file:///Applications/Open MTP.app/Contents/Resources/app.html';

  // the app page and its hash routes stay, even percent-encoded
  assert.strictEqual(navigationDecision(appUrl, appUrl), 'allow');
  assert.strictEqual(
    navigationDecision(
      'file:///Applications/Open%20MTP.app/Contents/Resources/app.html#faqsPage',
      appUrl
    ),
    'allow'
  );
  assert.ok(isAppPageUrl(`${appUrl}#appUpdatePage/updateProgress`, appUrl));

  // a file dropped on the window must never become a Node-enabled page
  assert.strictEqual(
    navigationDecision('file:///Users/me/Downloads/evil.html', appUrl),
    'block'
  );
  assert.strictEqual(
    navigationDecision('file:///Users/me/Pictures/photo.jpg', appUrl),
    'block'
  );
  assert.strictEqual(
    navigationDecision('data:text/html,<script>1</script>', appUrl),
    'block'
  );
  assert.strictEqual(
    // eslint-disable-next-line no-script-url
    navigationDecision('javascript:alert(1)', appUrl),
    'block'
  );
  assert.strictEqual(navigationDecision('not a url', appUrl), 'block');

  // links for the browser or the mail app go to macOS
  assert.strictEqual(
    navigationDecision(
      'https://github.com/phantumblade/OpenMTP-Refined',
      appUrl
    ),
    'external'
  );
  assert.strictEqual(
    navigationDecision('mailto:someone@example.com?Subject=OpenMTP', appUrl),
    'external'
  );
  assert.ok(!isExternalUrl('file:///etc/passwd'));
  assert.ok(!isExternalUrl('smb://server/share'));

  // eslint-disable-next-line no-console
  console.log('Navigation policy invariants: ok');
}

main();
