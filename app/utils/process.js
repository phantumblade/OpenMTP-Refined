import { spawn } from 'child_process';
import { checkIf } from './checkIf';
import { log } from './log';

const USB_CONFLICTING_APPS = [
  {
    name: 'Another OpenMTP instance',
    patterns: ['/applications/android-mac.app/'],
  },
  {
    name: 'Android File Transfer',
    patterns: ['android file transfer.app', 'android file transfer agent.app'],
  },
  {
    name: 'Google Drive',
    patterns: ['/google drive.app/', 'google drive.app/contents/macos'],
  },
  {
    name: 'Dropbox',
    patterns: ['/dropbox.app/', 'dropbox.app/contents/macos'],
  },
  {
    name: 'Microsoft OneDrive',
    patterns: ['/onedrive.app/', 'onedrive.app/contents/macos'],
  },
  {
    name: 'Samsung Smart Switch',
    patterns: ['smart switch', 'smartswitch'],
  },
  {
    name: 'Samsung Kies',
    patterns: ['/kies.app/', 'kiesagent'],
  },
  {
    name: 'macOS Image Capture / PTPCamera',
    patterns: ['ptpcamera.app', 'ptpcamera'],
  },
];

export const getRunningProcesses = () => {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const child = spawn('ps', ['-axo', 'pid=,comm=']);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      log.error(error, 'getRunningProcesses -> error');
      resolve([]);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        if (stderr) {
          log.error(stderr, 'getRunningProcesses -> close');
        }

        resolve([]);

        return;
      }

      const currentPid = process.pid;
      const parentPid = process.ppid;

      resolve(
        stdout
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => {
            if (!line) return false;
            const parts = line.split(/\s+/);
            const pid = parseInt(parts[0], 10);

            return pid !== currentPid && pid !== parentPid;
          })
          .map((line) => {
            const parts = line.split(/\s+/);

            return parts.slice(1).join(' ');
          })
      );
    });
  }).catch((error) => {
    log.error(error, 'getRunningProcesses -> catch');

    return [];
  });
};

export const isProcessRunning = async (query) => {
  checkIf(query, 'string');

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  const processes = await getRunningProcesses();

  return processes.some((processLine) =>
    processLine.toLowerCase().includes(normalizedQuery)
  );
};

export const findUsbConflictingApps = async () => {
  const processes = (await getRunningProcesses()).map((processLine) =>
    processLine.toLowerCase()
  );

  return USB_CONFLICTING_APPS.filter(({ patterns }) =>
    patterns.some((pattern) =>
      processes.some((processLine) => {
        if (pattern === 'ptpcamera' || pattern === 'ptpcamera.app') {
          return (
            processLine.endsWith('/ptpcamera') ||
            processLine.includes('ptpcamera.app/')
          );
        }

        return processLine.includes(pattern);
      })
    )
  ).map(({ name }) => name);
};
