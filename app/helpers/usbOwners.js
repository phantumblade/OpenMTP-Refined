import { execFile } from 'child_process';

// macOS records which process holds a USB device or interface exclusively
// ("UsbExclusiveOwner" in the IORegistry). Reading it tells us exactly who is
// blocking the phone instead of guessing from a list of known app names.

// Background daemons that grab MTP/PTP devices for Photos/Image Capture. They
// hold no user data and launchd restarts them on demand, so OpenMTP may stop
// them to take over the phone.
const RELEASABLE_OWNER_NAMES = ['ptpcamerad', 'ptpcamera'];

const unquote = (value) => value.trim().replace(/^"(.*)"$/, '$1');

// Parses `ioreg -r -c <class> -l -w0` output into the root objects' own
// properties (children such as user clients are skipped).
export const parseIoregObjects = (output) => {
  const objects = [];
  let current = null;

  String(output || '')
    .split('\n')
    .forEach((line) => {
      if (line.startsWith('+-o ')) {
        current = {
          name: line.slice(4).split('@')[0].split('  <')[0].trim(),
          props: {},
          inChildren: false,
        };
        objects.push(current);

        return;
      }

      if (!current || current.inChildren) {
        return;
      }

      if (line.includes('+-o ')) {
        current.inChildren = true;

        return;
      }

      const match = line.match(/"([^"]+)" = (.*)$/);

      if (match) {
        current.props[match[1]] = unquote(match[2]);
      }
    });

  return objects.map(({ name, props }) => ({ name, props }));
};

export const parseExclusiveOwner = (value) => {
  const match = String(value || '').match(/^pid (\d+), (.+)$/);

  if (!match) {
    return null;
  }

  return { pid: parseInt(match[1], 10), name: match[2].trim() };
};

const isMtpInterface = ({ name, props }) =>
  props.bInterfaceClass === '6' ||
  /^(MTP|PTP)$/i.test(props.kUSBString || '') ||
  /^(MTP|PTP)$/i.test(name);

export const isReleasableOwner = (owner) =>
  !!owner && RELEASABLE_OWNER_NAMES.includes(owner.name.toLowerCase());

// Combines interface and device registry dumps into one entry per phone.
export const findPhonesFromIoreg = ({ interfacesOutput, devicesOutput }) => {
  const devices = parseIoregObjects(devicesOutput);

  return parseIoregObjects(interfacesOutput)
    .filter(isMtpInterface)
    .map(({ props }) => {
      const device = devices.find(
        (item) => item.props.locationID === props.locationID
      );

      return {
        locationId: props.locationID,
        productName: props['USB Product Name'] || props['USB Vendor Name'],
        interfaceOwner: parseExclusiveOwner(props.UsbExclusiveOwner),
        deviceOwner: parseExclusiveOwner(device?.props?.UsbExclusiveOwner),
      };
    });
};

// Processes (other than [selfPids]) currently blocking a phone.
export const findPhoneBlockers = (phones, selfPids = []) => {
  const blockers = new Map();

  phones.forEach(({ interfaceOwner, deviceOwner }) => {
    [interfaceOwner, deviceOwner].forEach((owner) => {
      if (owner && !selfPids.includes(owner.pid)) {
        blockers.set(owner.pid, owner);
      }
    });
  });

  return Array.from(blockers.values());
};

const run = (file, args) =>
  new Promise((resolve) => {
    execFile(
      file,
      args,
      { timeout: 4000, maxBuffer: 32 * 1024 * 1024 },
      (error, stdout) => resolve(error ? '' : String(stdout))
    );
  });

export const getConnectedPhones = async () => {
  if (process.platform !== 'darwin') {
    return [];
  }

  const [interfacesOutput, devicesOutput] = await Promise.all([
    run('ioreg', ['-r', '-c', 'IOUSBHostInterface', '-l', '-w0']),
    run('ioreg', ['-r', '-c', 'IOUSBHostDevice', '-l', '-w0']),
  ]);

  return findPhonesFromIoreg({ interfacesOutput, devicesOutput });
};

const selfPids = () => [process.pid, process.ppid];

export const getPhoneUsbStatus = async () => {
  const phones = await getConnectedPhones();

  return {
    phones,
    blockers: findPhoneBlockers(phones, selfPids()),
  };
};

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (e) {
    return false;
  }
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Stops daemons like ptpcamerad that hold the phone, right before OpenMTP
// claims it. launchd restarts ptpcamerad after ~1s, so the caller must open the
// device immediately afterwards; once OpenMTP owns it the daemon can't take it.
export const releasePhoneFromSystemDaemons = async () => {
  const { blockers } = await getPhoneUsbStatus();
  const releasable = blockers.filter(isReleasableOwner);

  releasable.forEach(({ pid }) => {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (e) {
      // already gone
    }
  });

  if (releasable.length > 0) {
    // wait (briefly) for the kernel to drop the exclusive claim
    for (
      let i = 0;
      i < 10 && releasable.some(({ pid }) => isAlive(pid));
      i += 1
    ) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(20);
    }
  }

  return {
    released: releasable,
    blockers: blockers.filter((owner) => !isReleasableOwner(owner)),
  };
};

// Human readable name and bundle path for a blocking process.
export const describeProcess = async (pid) => {
  const command = (await run('ps', ['-o', 'args=', '-p', String(pid)])).trim();
  const appMatch = command.match(/^(.*?\/([^/]+)\.app)\/Contents\/MacOS\//);

  if (/\/electron\.app\/contents\/macos\/electron/i.test(command)) {
    return {
      command,
      appPath: null,
      displayName: /main\.(dev|prod)\.js/.test(command)
        ? 'OpenMTP (development build)'
        : 'Electron',
    };
  }

  return {
    command,
    appPath: appMatch ? appMatch[1] : null,
    displayName: appMatch ? appMatch[2] : null,
  };
};

// Asks a blocking process to quit the normal way (like Cmd+Q for apps) and
// waits for it to exit. Never force-kills user apps.
export const quitBlockingProcess = async (owner) => {
  if (isReleasableOwner(owner)) {
    try {
      process.kill(owner.pid, 'SIGKILL');
    } catch (e) {
      // already gone
    }

    return !isAlive(owner.pid);
  }

  const { appPath } = await describeProcess(owner.pid);

  if (appPath) {
    await run('osascript', [
      '-e',
      `tell application ${JSON.stringify(appPath)} to quit`,
    ]);
  } else {
    try {
      process.kill(owner.pid, 'SIGTERM');
    } catch (e) {
      // already gone
    }
  }

  for (let i = 0; i < 50 && isAlive(owner.pid); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  return !isAlive(owner.pid);
};
