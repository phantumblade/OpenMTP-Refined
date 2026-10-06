const assert = require('assert');
const {
  findPhoneBlockers,
  findPhonesFromIoreg,
  isReleasableOwner,
  parseExclusiveOwner,
} = require('../../app/helpers/usbOwners');

// Trimmed `ioreg -r -c ... -l -w0` output captured with a Samsung phone that
// macOS' ptpcamerad had grabbed.
const interfacesOutput = [
  '+-o IOUSBHostInterface@0  <class IOUSBHostInterface, id 0x1, registered>',
  '    {',
  '      "bInterfaceClass" = 3',
  '      "locationID" = 1048576',
  '    }',
  '+-o MTP@0  <class IOUSBHostInterface, id 0x1000a712a, registered, matched>',
  '  | {',
  '  |   "bInterfaceClass" = 6',
  '  |   "USB Product Name" = "SAMSUNG_Android"',
  '  |   "locationID" = 17825792',
  '  |   "UsbExclusiveOwner" = "pid 46502, ptpcamerad"',
  '  |   "kUSBString" = "MTP"',
  '  | }',
  '  | ',
  '  +-o ptpcamerad  <class AppleUSBHostInterfaceUserClient, id 0x2>',
  '      {',
  '        "IOUserClientCreator" = "pid 46502, ptpcamerad"',
  '        "UsbExclusiveOwner" = "pid 1, should-be-ignored"',
  '      }',
  '+-o CDC Abstract Control Model (ACM)@1  <class IOUSBHostInterface, id 0x3>',
  '    {',
  '      "bInterfaceClass" = 2',
  '      "locationID" = 17825792',
  '      "UsbExclusiveOwner" = "AppleUSBACMControl"',
  '    }',
].join('\n');

const devicesOutput = [
  '+-o SAMSUNG_Android@01100000  <class IOUSBHostDevice, id 0x1000a7122>',
  '  | {',
  '  |   "USB Product Name" = "SAMSUNG_Android"',
  '  |   "UsbExclusiveOwner" = "pid 80418, OpenMTP Helper ("',
  '  |   "locationID" = 17825792',
  '  | }',
].join('\n');

function main() {
  assert.deepStrictEqual(parseExclusiveOwner('pid 46502, ptpcamerad'), {
    pid: 46502,
    name: 'ptpcamerad',
  });
  // kernel drivers own interfaces without a pid: not a process to deal with
  assert.strictEqual(parseExclusiveOwner('AppleUSBACMControl'), null);
  assert.strictEqual(parseExclusiveOwner(undefined), null);

  const phones = findPhonesFromIoreg({ interfacesOutput, devicesOutput });

  // only the MTP interface counts, and child user clients are not mixed in
  assert.deepStrictEqual(phones, [
    {
      locationId: '17825792',
      productName: 'SAMSUNG_Android',
      interfaceOwner: { pid: 46502, name: 'ptpcamerad' },
      deviceOwner: { pid: 80418, name: 'OpenMTP Helper (' },
    },
  ]);

  // our own renderer holding the device is not a blocker; ptpcamerad is
  const blockers = findPhoneBlockers(phones, [80418]);

  assert.deepStrictEqual(blockers, [{ pid: 46502, name: 'ptpcamerad' }]);
  assert.ok(isReleasableOwner(blockers[0]));
  assert.ok(!isReleasableOwner({ pid: 9, name: 'Android File Transfer' }));

  // no phone on USB
  assert.deepStrictEqual(
    findPhonesFromIoreg({ interfacesOutput: '', devicesOutput: '' }),
    []
  );

  // eslint-disable-next-line no-console
  console.log('USB owner detection invariants: ok');
}

main();
