import { ipcRenderer, shell } from 'electron';
import { IpcEvents } from '../services/ipc-events/IpcEventType';
import { UPDATE_REPOSITORY } from './appUpdateRelease';
import { log } from '../utils/log';

// The app update as the side menu shows it, kept in sync with the main
// process (classes/AppUpdate): idle, available (found, not downloaded),
// downloading (with percent) or ready (downloaded and verified).

const IDLE = { state: 'idle', version: null, percent: 0 };
const listeners = new Set();
let status = IDLE;
let started = false;

const set = (next) => {
  status = { ...IDLE, ...next };
  listeners.forEach((listener) => listener(status));
};

const start = () => {
  if (started) {
    return;
  }

  started = true;
  ipcRenderer.on(IpcEvents.APP_UPDATE_STATUS, (_, next) => set(next));
  // the updater may have found something before this window loaded; it
  // isn't running at all in development or outside Applications
  ipcRenderer
    .invoke(IpcEvents.APP_UPDATE_STATUS_GET)
    .then((current) => current && set(current))
    .catch(() => {});
};

export const getAppUpdateStatus = () => {
  start();

  return status;
};

export const subscribeToAppUpdateStatus = (listener) => {
  start();
  listeners.add(listener);

  return () => listeners.delete(listener);
};

// something to tell the user about (the badge on the menu button)
export const hasAppUpdateNews = ({ state }) =>
  state === 'available' || state === 'ready';

export const installAppUpdate = () => {
  ipcRenderer.send(IpcEvents.APP_UPDATE_INSTALL);
};

export const openAppUpdateNotes = (version) => {
  const { owner, repo } = UPDATE_REPOSITORY;
  const page = version ? `releases/tag/v${version}` : 'releases/latest';

  shell
    .openExternal(`https://github.com/${owner}/${repo}/${page}`)
    .catch((e) => log.error(e, 'openAppUpdateNotes'));
};
