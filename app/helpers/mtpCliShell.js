// Escapes a path for the legacy mtp-cli, whose commands are run through a
// shell as `"lsext \"<path>\""`: the shell unquotes one level, mtp-cli the
// next. Inside double quotes the shell still expands `$`, so it is escaped
// last (its backslash must not be doubled): a phone file named
// `$(command).jpg` must never run `command` on the Mac.
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
