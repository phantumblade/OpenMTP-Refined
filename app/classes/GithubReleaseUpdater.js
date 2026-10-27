import { EventEmitter } from 'events';
import { app, net } from 'electron';
import { execFile, spawn } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import {
  INSTALL_SCRIPT,
  UPDATE_BUNDLE_ID,
  UPDATE_REPOSITORY,
  UpdateError,
  bundlePathFromExecutable,
  pickUpdate,
} from '../helpers/appUpdateRelease';
import { log } from '../utils/log';
import { translateWithSetting as tr } from '../helpers/translateWithSetting';

const execFileAsync = promisify(execFile);

const WORK_DIR_PREFIX = 'openmtp-update-';
// abort a download that stops sending data
const DOWNLOAD_STALL_MS = 60 * 1000;
const PROGRESS_INTERVAL_MS = 250;

/**
 * Updates OpenMTP Refined from the fork's GitHub releases. Squirrel.Mac (used
 * by electron-updater) only installs apps signed with an Apple Developer ID,
 * which the fork's ad-hoc signed builds aren't, so this replaces the app
 * bundle itself after it quits (see INSTALL_SCRIPT).
 *
 * It mirrors the parts of electron-updater's API that AppUpdate uses:
 * events 'checking-for-update', 'update-available', 'update-not-available',
 * 'download-progress', 'update-downloaded' and 'error'.
 */
export default class GithubReleaseUpdater extends EventEmitter {
  constructor({ currentVersion, allowPrerelease = false }) {
    super();

    this.currentVersion = currentVersion;
    this.allowPrerelease = allowPrerelease;
    this.availableUpdate = null;
    this.preparedUpdate = null;
    this.downloading = null;
    this.installOnQuitRegistered = false;
  }

  async checkForUpdates() {
    this.emit('checking-for-update');

    try {
      this.removeLeftovers();

      const { owner, repo } = UPDATE_REPOSITORY;
      const releases = JSON.parse(
        await this.request(
          `https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`,
          // body_html: the release notes as HTML, for the update window
          { Accept: 'application/vnd.github.html+json' }
        )
      );
      const update = pickUpdate(releases, {
        currentVersion: this.currentVersion,
        allowPrerelease: this.allowPrerelease,
        arch: process.arch === 'arm64' ? 'arm64' : 'x64',
      });

      if (!update) {
        this.emit('update-not-available');

        return null;
      }

      this.availableUpdate = update;
      this.emit('update-available', {
        version: update.version,
        releaseName: update.releaseName,
        releaseNotes: update.releaseNotes,
      });

      return update;
    } catch (e) {
      this.emit('error', e);

      return null;
    }
  }

  downloadUpdate() {
    if (!this.availableUpdate) {
      return Promise.resolve(null);
    }

    if (!this.downloading) {
      this.downloading = this.download(this.availableUpdate)
        .then((prepared) => {
          this.preparedUpdate = prepared;
          this.emit('update-downloaded', { version: prepared.version });

          return prepared;
        })
        .catch((e) => {
          this.emit('error', e);

          return null;
        })
        .finally(() => {
          this.downloading = null;
        });
    }

    return this.downloading;
  }

  async download(update) {
    // fail before downloading if the installed app can't be replaced
    this.installedBundle();

    const workDir = this.createWorkDir();
    const file = path.join(workDir, path.basename(update.asset.name));
    const sha256 = await this.downloadFile(update.asset.url, file, (percent) =>
      this.emit('download-progress', { percent })
    );

    if (sha256 !== update.asset.sha256) {
      throw new UpdateError(
        tr(
          'The downloaded update is damaged (its checksum does not match). Try again later.'
        )
      );
    }

    return this.prepare(file, workDir, update.version);
  }

  /**
   * A DMG, ZIP or .app chosen by the user (e.g. a local build): checked the
   * same way as a download, any version accepted.
   */
  prepareLocalUpdate(filePath) {
    return this.prepare(filePath, this.createWorkDir(), null).then(
      (prepared) => {
        this.preparedUpdate = prepared;

        return prepared;
      }
    );
  }

  // Unpacks the bundle into [workDir] and checks it really is OpenMTP.
  async prepare(filePath, workDir, expectedVersion) {
    const target = this.installedBundle();
    const appDir = path.join(workDir, 'app');

    // only ever replace OpenMTP itself
    if (
      (await this.readBundleInfo(target)).CFBundleIdentifier !==
      UPDATE_BUNDLE_ID
    ) {
      throw new UpdateError(tr('Only an installed OpenMTP can update itself.'));
    }

    fs.mkdirSync(appDir, { recursive: true });

    if (/\.dmg$/i.test(filePath)) {
      await this.copyFromDiskImage(filePath, workDir, appDir);
    } else if (/\.zip$/i.test(filePath)) {
      await execFileAsync('ditto', ['-x', '-k', filePath, appDir]);
    } else if (/\.app\/?$/i.test(filePath)) {
      if (fs.realpathSync(filePath) === fs.realpathSync(target)) {
        throw new UpdateError(
          tr('This is the copy of OpenMTP already installed.')
        );
      }

      await execFileAsync('ditto', [
        filePath,
        path.join(appDir, path.basename(filePath)),
      ]);
    } else {
      throw new UpdateError(tr('Choose a DMG, ZIP or app of OpenMTP.'));
    }

    const bundle = this.findBundle(appDir);
    const info = await this.readBundleInfo(bundle);

    if (info.CFBundleIdentifier !== UPDATE_BUNDLE_ID) {
      throw new UpdateError(tr('This file does not contain OpenMTP Refined.'));
    }

    const version = info.CFBundleShortVersionString;

    if (expectedVersion && version !== expectedVersion) {
      throw new UpdateError(
        tr('The download contains version {version} instead of {expected}.', {
          version,
          expected: expectedVersion,
        })
      );
    }

    await this.checkArchitecture(
      path.join(bundle, 'Contents', 'MacOS', info.CFBundleExecutable)
    );

    return { version, bundle, workDir, target };
  }

  async copyFromDiskImage(dmg, workDir, appDir) {
    const mountPoint = path.join(workDir, 'mount');

    fs.mkdirSync(mountPoint, { recursive: true });
    await execFileAsync('hdiutil', [
      'attach',
      '-nobrowse',
      '-readonly',
      '-noautoopen',
      '-mountpoint',
      mountPoint,
      dmg,
    ]);

    try {
      const bundle = this.findBundle(mountPoint);

      await execFileAsync('ditto', [
        bundle,
        path.join(appDir, path.basename(bundle)),
      ]);
    } finally {
      await execFileAsync('hdiutil', ['detach', mountPoint, '-force']).catch(
        (e) => log.error(e, 'GithubReleaseUpdater.copyFromDiskImage.detach')
      );
    }
  }

  findBundle(dir) {
    const name = fs
      .readdirSync(dir)
      .find(
        (entry) =>
          entry.endsWith('.app') &&
          fs.lstatSync(path.join(dir, entry)).isDirectory()
      );

    if (!name) {
      throw new UpdateError(tr('No OpenMTP app was found in this file.'));
    }

    return path.join(dir, name);
  }

  async readBundleInfo(bundle) {
    try {
      const { stdout } = await execFileAsync('plutil', [
        '-convert',
        'json',
        '-o',
        '-',
        path.join(bundle, 'Contents', 'Info.plist'),
      ]);

      return JSON.parse(stdout);
    } catch (e) {
      throw new UpdateError(tr('This file does not contain OpenMTP Refined.'));
    }
  }

  // an Apple silicon build can't start on an Intel Mac (and vice versa)
  async checkArchitecture(executable) {
    const wanted = process.arch === 'arm64' ? 'arm64' : 'x86_64';
    let description = '';

    try {
      description = (await execFileAsync('file', ['-b', executable])).stdout;
    } catch (e) {
      // `file` unavailable: the release asset name already matched the arch
      return;
    }

    if (!description.includes(wanted)) {
      throw new UpdateError(
        tr('This version of OpenMTP is not built for this Mac ({arch}).', {
          arch: wanted,
        })
      );
    }
  }

  installedBundle() {
    const target = bundlePathFromExecutable(app.getPath('exe'));

    if (!target) {
      throw new UpdateError(tr('OpenMTP is not running from an app bundle.'));
    }

    try {
      fs.accessSync(path.dirname(target), fs.constants.W_OK);
      fs.accessSync(target, fs.constants.W_OK);
    } catch (e) {
      throw new UpdateError(
        tr(
          "OpenMTP can't replace itself in {folder}: install the new version from the DMG instead.",
          { folder: path.dirname(target) }
        )
      );
    }

    return target;
  }

  quitAndInstall() {
    this.startInstaller(true);
    app.quit();
  }

  // Installs the prepared update when the app quits, without reopening it.
  installOnQuit() {
    if (this.installOnQuitRegistered) {
      return;
    }

    this.installOnQuitRegistered = true;
    app.once('will-quit', () => {
      if (this.preparedUpdate && !this.installerStarted) {
        this.startInstaller(false);
      }
    });
  }

  startInstaller(relaunch) {
    const { bundle, workDir, target } = this.preparedUpdate || {};

    if (!bundle) {
      throw new UpdateError(tr('No update is ready to install.'));
    }

    const script = path.join(workDir, 'install.sh');
    const logFile = path.join(os.tmpdir(), 'openmtp-update.log');

    fs.writeFileSync(script, INSTALL_SCRIPT, { mode: 0o700 });

    const out = fs.openSync(logFile, 'a');

    // detached: it has to outlive OpenMTP, which it waits for
    spawn(
      '/bin/sh',
      [
        script,
        String(process.pid),
        target,
        bundle,
        relaunch ? '1' : '0',
        workDir,
      ],
      { detached: true, stdio: ['ignore', out, out] }
    ).unref();

    this.installerStarted = true;
  }

  createWorkDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), WORK_DIR_PREFIX));
  }

  // work folders of downloads that were never installed
  removeLeftovers() {
    if (this.downloading || this.preparedUpdate) {
      return;
    }

    try {
      fs.readdirSync(os.tmpdir())
        .filter((entry) => entry.startsWith(WORK_DIR_PREFIX))
        .forEach((entry) =>
          fs.rmSync(path.join(os.tmpdir(), entry), {
            recursive: true,
            force: true,
          })
        );
    } catch (e) {
      log.error(e, 'GithubReleaseUpdater.removeLeftovers');
    }
  }

  openRequest(url, headers, onResponse, reject) {
    const request = net.request({ url, redirect: 'follow' });

    request.setHeader('User-Agent', `OpenMTP-Refined/${this.currentVersion}`);
    Object.entries(headers).forEach(([key, value]) =>
      request.setHeader(key, value)
    );
    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        reject(
          new UpdateError(
            tr('The update server answered {status}. Try again later.', {
              status: response.statusCode,
            })
          )
        );

        return;
      }

      onResponse(response);
    });
    request.on('error', reject);
    request.end();

    return request;
  }

  request(url, headers = {}) {
    return new Promise((resolve, reject) => {
      this.openRequest(
        url,
        headers,
        (response) => {
          const chunks = [];

          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () =>
            resolve(Buffer.concat(chunks).toString('utf8'))
          );
          response.on('error', reject);
        },
        reject
      );
    });
  }

  // Streams [url] to [file]; resolves with its SHA-256.
  downloadFile(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const output = fs.createWriteStream(file);
      let stallTimer = null;
      let request = null;

      const fail = (e) => {
        clearTimeout(stallTimer);
        output.destroy();
        request?.abort();
        reject(e);
      };
      const armStallTimer = () => {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(
          () =>
            fail(
              new UpdateError(
                tr('The download stopped responding. Try again later.')
              )
            ),
          DOWNLOAD_STALL_MS
        );
      };

      request = this.openRequest(
        url,
        {},
        (response) => {
          const total = Number(response.headers['content-length']) || 0;
          let received = 0;
          let lastProgressAt = 0;

          armStallTimer();
          response.on('data', (chunk) => {
            armStallTimer();
            hash.update(chunk);
            received += chunk.length;

            const now = Date.now();

            if (total > 0 && now - lastProgressAt >= PROGRESS_INTERVAL_MS) {
              lastProgressAt = now;
              onProgress(Math.min(100, (received / total) * 100));
            }

            // a disk slower than the network: wait for it
            if (!output.write(chunk) && typeof response.pause === 'function') {
              response.pause();
              output.once('drain', () => response.resume());
            }
          });
          response.on('end', () => {
            clearTimeout(stallTimer);
            output.end(() => {
              onProgress(100);
              resolve(hash.digest('hex'));
            });
          });
          response.on('error', fail);
          response.on('aborted', () =>
            fail(new UpdateError(tr('The download was interrupted.')))
          );
        },
        fail
      );
      output.on('error', fail);
    });
  }
}
