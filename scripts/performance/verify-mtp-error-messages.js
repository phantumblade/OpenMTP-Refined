const assert = require('assert');
const { describeMtpError } = require('../../app/helpers/mtpErrorMessages');
const { translate } = require('../../app/i18n');
const { MTP_ERROR } = require('../../app/enums/mtpError');

function main() {
  assert.strictEqual(describeMtpError(''), null);
  assert.strictEqual(describeMtpError(undefined), null);

  // the case from the field: a locked phone exposes no storage
  assert.strictEqual(
    describeMtpError(MTP_ERROR.ErrorNoStorage).title,
    'The phone is locked'
  );
  assert.strictEqual(
    describeMtpError('OpenSession after reset: LIBUSB_ERROR_NOT_FOUND').title,
    'The phone did not respond'
  );
  assert.strictEqual(
    describeMtpError(MTP_ERROR.ErrorMtpLockExists).title,
    'Another operation is still running'
  );

  // every connection-related code gets a specific explanation, never the raw code
  [
    'ErrorNoStorage',
    'ErrorStorageInfo',
    'ErrorAllowStorageAccess',
    'ErrorDeviceLocked',
    'ErrorMultipleDevice',
    'ErrorDeviceChanged',
    'ErrorMtpLockExists',
    'ErrorMtpDetectFailed',
    'ErrorDeviceSetup',
    'ErrorDeviceInfo',
  ].forEach((code) => {
    const message = describeMtpError(code);

    assert.ok(message && message.technicalDetail === null, code);
    assert.ok(!message.title.includes(code), code);
  });

  // unknown errors fall back to a helpful message, keeping the raw text aside
  const unknown = describeMtpError('Something odd');

  assert.strictEqual(unknown.title, 'The connection did not work');
  assert.strictEqual(unknown.technicalDetail, 'Something odd');

  // all user-facing strings are translated to Italian
  [...Object.values(MTP_ERROR).map(describeMtpError), unknown].forEach(
    ({ title, body, steps }) => {
      [title, body, ...steps].forEach((text) => {
        assert.notStrictEqual(
          translate('it', text),
          text,
          `untranslated: ${text}`
        );
      });
    }
  );

  // eslint-disable-next-line no-console
  console.log('MTP error message invariants: ok');
}

main();
