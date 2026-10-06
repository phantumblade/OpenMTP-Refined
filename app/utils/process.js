import { spawn } from 'child_process';
import { checkIf } from './checkIf';
import { log } from './log';

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
