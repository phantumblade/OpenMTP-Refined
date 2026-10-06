import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';
import { log } from '../utils/log';

// macOS 26 draws bundle icons that don't fill the standard squircle (like our
// tilted one) inside a grey container, but leaves Finder custom icons alone.
// The custom icon can't ship inside the DMG: its Finder metadata would break
// the bundle's code signature and Gatekeeper would report the app as damaged.
// So the app attaches it to itself after it has been opened once.

// Darwin 25 is macOS 26
const FIRST_AFFECTED_DARWIN_MAJOR = 25;

const SET_ICON_SCRIPT = `
ObjC.import('AppKit');
function run(argv) {
  const image = $.NSImage.alloc.initWithContentsOfFile(argv[0]);
  if (!$.NSWorkspace.sharedWorkspace.setIconForFileOptions(image, argv[1], 0)) {
    throw new Error('Unable to set custom icon');
  }
}
`;

const appBundlePath = () =>
  path.resolve(path.dirname(app.getPath('exe')), '..', '..');

export const shouldApplyCustomAppIcon = ({ platform, darwinMajor, bundle }) =>
  platform === 'darwin' &&
  darwinMajor >= FIRST_AFFECTED_DARWIN_MAJOR &&
  bundle.endsWith('.app');

export function applyCustomAppIcon() {
  try {
    const bundle = appBundlePath();
    const darwinMajor = Number(os.release().split('.')[0]);

    if (
      !shouldApplyCustomAppIcon({
        platform: process.platform,
        darwinMajor,
        bundle,
      })
    ) {
      return;
    }

    const icon = path.join(bundle, 'Contents', 'Resources', 'icon.icns');

    // Finder stores a custom icon in this file inside the bundle
    if (fs.existsSync(path.join(bundle, 'Icon\r')) || !fs.existsSync(icon)) {
      return;
    }

    fs.accessSync(bundle, fs.constants.W_OK);

    const child = spawn('osascript', ['-l', 'JavaScript', '-', icon, bundle], {
      stdio: ['pipe', 'ignore', 'pipe'],
    });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => {
      if (code !== 0) {
        log.info(`custom app icon not applied: ${stderr.trim()}`);
      }
    });
    child.on('error', () => {});
    child.stdin.end(SET_ICON_SCRIPT);
  } catch (e) {
    // read-only location (e.g. still inside the DMG): keep the bundle icon
  }
}
