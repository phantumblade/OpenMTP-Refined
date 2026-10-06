// Turns raw MTP/Kalam errors (codes such as "ErrorNoStorage" or libusb
// messages) into something a person can act on: a short title, what to do,
// and a Material Symbol. Strings are English i18n keys.

const RULES = [
  {
    // Android hides its storage until the phone is unlocked and the user
    // allows file access
    test: /ErrorNoStorage|ErrorStorageInfo|ErrorAllowStorageAccess|ErrorDeviceLocked|storage is inaccessible|unlock/i,
    symbol: 'mobile_lock_portrait',
    title: 'The phone is locked',
    body: 'Android shows its files only while the phone is unlocked and you have allowed access.',
    steps: [
      'Unlock the phone screen.',
      'If the phone asks “Allow access to phone data?”, tap Allow.',
      'Press Try connection again.',
    ],
  },
  {
    test: /ErrorMultipleDevice|multiple mtp/i,
    symbol: 'devices',
    title: 'More than one phone is connected',
    body: 'Disconnect the other Android devices and keep only the one you want to use.',
  },
  {
    test: /ErrorDeviceChanged/i,
    symbol: 'sync_problem',
    title: 'A different phone was connected',
    body: 'Try the connection again to open the phone that is plugged in now.',
  },
  {
    test: /ErrorMtpLockExists|operation in progress/i,
    symbol: 'hourglass',
    title: 'Another operation is still running',
    body: 'Wait a few seconds for it to finish, then try again.',
  },
  {
    test: /busy|claim|LIBUSB_ERROR_ACCESS|LIBUSB_ERROR_BUSY/i,
    symbol: 'block',
    title: 'Another app is using the phone',
    body: 'Close apps that access Android phones (for example Android File Transfer or Smart Switch), then try again.',
  },
  {
    test: /ErrorMtpDetectFailed|no mtp/i,
    symbol: 'usb_off',
    title: 'No phone in File Transfer mode',
    body: 'Check the cable and choose File Transfer in the USB notification on the phone.',
  },
  {
    test: /ErrorDeviceSetup|ErrorDeviceInfo|LIBUSB_ERROR|OpenSession|setting up/i,
    symbol: 'mobile_off',
    title: 'The phone did not respond',
    body: 'The Mac sees the phone, but the phone did not accept the connection. This usually happens when its screen is locked or an access request is waiting on the phone.',
    steps: [
      'Unlock the phone and look for an access request: tap Allow.',
      'In the USB notification, choose File Transfer.',
      'If it still fails, unplug and reconnect the cable, then press Try connection again.',
    ],
  },
];

const FALLBACK = {
  symbol: 'error',
  title: 'The connection did not work',
  body: 'Unlock the phone, reconnect the cable and try again.',
};

export const describeMtpError = (error) => {
  const text = String(error || '').trim();

  if (!text) {
    return null;
  }

  const rule = RULES.find(({ test }) => test.test(text));

  return {
    steps: [],
    ...(rule || FALLBACK),
    test: undefined,
    // raw detail kept for support, shown in small print only when unknown
    technicalDetail: rule ? null : text,
  };
};
