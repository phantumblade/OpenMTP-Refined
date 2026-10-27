// Arguments for the legacy mtp-cli. It used to run through a shell as
// `"lsext \"<escaped path>\""`; escapeShellMtp below is that escaping, kept
// so mtp-cli still receives exactly the same text. mtp-cli now runs without
// a shell (see MTP_CLI_ARGS), because no escaping could be trusted: a phone
// file named `a\$(command)` still ran `command` on the Mac.
export const escapeShellMtp = (cmd) => {
  let escaped;

  if (cmd.indexOf(`\\"`) !== -1 && cmd.indexOf(`"\\`) !== -1) {
    escaped = cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  } else if (cmd.indexOf(`"\\"`) !== -1) {
    escaped = cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  } else if (cmd.indexOf(`\\"`) !== -1) {
    escaped = cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\`)
      .replace(/"/g, `\\\\\\\\"`);
  } else if (cmd.indexOf(`"\\`) !== -1) {
    escaped = cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  } else {
    escaped = cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }

  return escaped.replace(/\$/g, '\\$');
};

// What /bin/sh turns a double-quoted word into: inside double quotes a
// backslash only escapes $ ` " \ and newline, and is kept before anything
// else.
const unquoteShellDoubleQuoted = (value) => {
  let result = '';

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const next = value[i + 1];

    if (char === '\\' && next !== undefined && '$`"\\\n'.includes(next)) {
      result += next;
      i += 1;
    } else {
      result += char;
    }
  }

  return result;
};

/**
 * A path as mtp-cli itself expects it inside its quoted command argument
 * (e.g. `lsext "<path>"`), for running mtp-cli without a shell: exactly what
 * the shell used to hand over for escapeShellMtp(path).
 */
export const mtpCliArgument = (filePath) =>
  unquoteShellDoubleQuoted(escapeShellMtp(filePath));

const quoted = (filePath) => `"${mtpCliArgument(filePath)}"`;

// argv for each mtp-cli command, passed to execFile/spawn without a shell
export const MTP_CLI_ARGS = {
  storageList: () => ['storage-list'],
  properties: (storageId, filePath) => [
    `storage ${storageId}`,
    `properties ${quoted(filePath)}`,
  ],
  listFiles: (storageId, filePath) => [
    `storage ${storageId}`,
    `lsext ${quoted(filePath)}`,
  ],
  rename: (storageId, filePath, newFilename) => [
    `storage ${storageId}`,
    `rename ${quoted(filePath)} ${quoted(newFilename)}`,
  ],
  remove: (storageId, filePath) => [
    `storage ${storageId}`,
    `rm ${quoted(filePath)}`,
  ],
  makeDirectory: (storageId, filePath) => [
    `storage ${storageId}`,
    `mkpath ${quoted(filePath)}`,
  ],
  // one `-e` block per file of a transfer
  download: (storageId, source, destination) => [
    '-e',
    `storage ${storageId}`,
    `get ${quoted(source)} ${quoted(destination)}`,
  ],
  upload: (storageId, source, destination) => [
    '-e',
    `storage ${storageId}`,
    `put ${quoted(source)} ${quoted(destination)}`,
  ],
  debugReport: () => ['pwd', '-v'],
};
