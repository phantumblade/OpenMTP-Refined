// `xattr -px com.apple.FinderInfo <path>` prints the 32 FinderInfo bytes as
// hex. The Finder flags are bytes 8-9 for files and folders alike, and
// kHasCustomIcon is 0x0400: bit 0x04 of byte 8. Copying an app (ditto, an
// update, a restore) keeps the Icon\r file inside the bundle but can drop
// this flag, and Finder then shows the plain bundle icon again.
export const finderInfoHasCustomIcon = (xattrHex) => {
  const bytes = String(xattrHex || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((byte) => parseInt(byte, 16));

  // eslint-disable-next-line no-bitwise
  return bytes.length >= 10 && (bytes[8] & 0x04) !== 0;
};
