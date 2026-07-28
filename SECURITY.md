# Security policy

## Supported versions

This fork is still under development and does not currently publish supported
binary releases. Electron 18 is outside its current upstream support window;
public binary distribution will remain disabled until the runtime migration
and regression tests are complete.

## Reporting a vulnerability

Do not open a public issue for vulnerabilities involving arbitrary file
access, command execution, USB/MTP parsing, update delivery, credentials or
code signing.

After this fork is published, use GitHub's private vulnerability reporting or
a private security advisory for the repository. Include:

- affected commit and macOS architecture;
- connected device and MTP mode, without serial numbers;
- minimum reproduction steps;
- relevant redacted logs;
- expected and observed behaviour.

Never attach personal files, device serial numbers, tokens, certificates or
unredacted filesystem paths.
