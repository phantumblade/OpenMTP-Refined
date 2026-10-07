const OS_ARCH_TYPE = {
  amd64: 'amd64',
  arm64: 'arm64',
};

const getBinariesSupportedSystemArchitecture = () => {
  if (process.arch === 'arm64') {
    return OS_ARCH_TYPE.arm64;
  }

  return OS_ARCH_TYPE.amd64;
};

module.exports = () => {
  const getExtraFiles = () => {
    const currentSystemArch = getBinariesSupportedSystemArchitecture();

    let macResourceBinFilter;

    switch (currentSystemArch) {
      case OS_ARCH_TYPE.arm64:
        macResourceBinFilter = [`${OS_ARCH_TYPE.arm64}/**/*`, `mtp-cli`];
        break;

      case OS_ARCH_TYPE.amd64:
      default:
        macResourceBinFilter = [
          `${OS_ARCH_TYPE.amd64}/**/*`,
          `medieval/${OS_ARCH_TYPE.amd64}/**/*`,
          `mtp-cli`,
        ];

        break;
    }

    return [
      {
        from: 'build/mac/bin',
        to: 'Resources/bin',
        filter: macResourceBinFilter,
      },
    ];
  };

  return {
    productName: 'OpenMTP',
    appId: 'io.github.phantumblade.openmtp',
    forceCodeSigning: process.env.FORCE_CODE_SIGNING === 'true',
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${name}-${version}-${os}-${arch}.${ext}',
    copyright: '© Ganesh Rathinavel; modifications © 2026 Andrea Perini',
    afterPack: './internals/scripts/AfterPack.js',
    afterSign: './internals/scripts/Notarize.js',
    npmRebuild: false,
    // Publishing remains disabled until this fork has its own reviewed target.
    publish: [],
    files: [
      'app/dist/',
      'app/app.html',
      'app/main.prod.js',
      'app/main.prod.js.map',
      'package.json',
    ],
    extraFiles: getExtraFiles(),
    mac: {
      type: 'distribution',
      icon: 'app/app.icns',
      category: 'public.app-category.productivity',
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: './build/entitlements.mac.plist',
      entitlementsInherit: './build/entitlements.mac.plist',
      extendInfo: {
        LSMinimumSystemVersion: '10.11.0',
        NSDesktopFolderUsageDescription:
          'OpenMTP shows your Desktop files only when you open the Desktop folder, so you can copy them to or from your phone.',
        NSDocumentsFolderUsageDescription:
          'OpenMTP shows your Documents only when you open that folder, so you can copy files to or from your phone.',
        NSDownloadsFolderUsageDescription:
          'OpenMTP shows your Downloads only when you open that folder, so you can copy files to or from your phone.',
        NSRemovableVolumesUsageDescription:
          'OpenMTP shows the files on an external or removable disk only when you open it, so you can copy them to or from your phone.',
        NSNetworkVolumesUsageDescription:
          'OpenMTP shows the files on a network disk only when you open it, so you can copy them to or from your phone.',
      },
      target: {
        target: 'default',
      },
    },
    mas: {
      type: 'distribution',
      category: 'public.app-category.productivity',
      entitlements: 'build/entitlements.mas.plist',
      icon: 'build/icon.icns',
      binaries: ['dist/mas/OpenMTP.app/Contents/Resources/bin/mtp-cli'],
    },
    // The local build (scripts/build-local-mac.sh) makes the DMG with
    // dmgbuild and build/dmg/dmgbuild-settings.py; this block mirrors it for
    // electron-builder's own DMG target. build/dmg/background.tiff holds the
    // 1x and 2x art (made from build/dmg/background.html). Finder always draws
    // icon labels in black on a DMG background, so the art stays light.
    dmg: {
      background: 'build/dmg/background.tiff',
      iconSize: 100,
      iconTextSize: 13,
      window: {
        width: 640,
        height: 400,
      },
      contents: [
        {
          x: 170,
          y: 196,
        },
        {
          x: 470,
          y: 196,
          type: 'link',
          path: '/Applications',
        },
      ],
    },
    win: {
      target: ['nsis'],
    },
    linux: {
      target: ['deb', 'AppImage'],
      category: 'public.app-category.productivity',
    },
  };
};
