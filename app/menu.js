import { app, Menu } from 'electron';
import {
  appFeaturesWindow,
  keyboardShortcutsWindow,
  privacyPolicyWindow,
  reportBugsWindow,
} from './helpers/createWindows';
import { ENV_FLAVOR } from './constants/env';
import { APP_NAME, APP_GITHUB_URL } from './constants/meta';
import { openExternalUrl } from './utils/url';
import { BUY_ME_A_COFFEE_URL } from './constants';
import { inviteViaEmail } from './templates/menu';
import { translateWithSetting } from './helpers/translateWithSetting';

export default class MenuBuilder {
  constructor({ mainWindow, autoAppUpdate, appUpdaterEnable }) {
    this.mainWindow = mainWindow;
    this.autoAppUpdate = autoAppUpdate;
    this.appUpdaterEnable = appUpdaterEnable;
  }

  buildMenu() {
    if (ENV_FLAVOR.allowDevelopmentEnvironment) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          },
        },
      ]).popup(this.mainWindow);
    });

    this.mainWindow.openDevTools();
  }

  buildDarwinTemplate() {
    // translated when built; main.dev rebuilds the menu when the language changes
    const t = translateWithSetting;
    const subMenuAbout = {
      label: `${APP_NAME}`,
      submenu: [
        {
          label: t('About {app}', { app: APP_NAME }),
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          visible: this.appUpdaterEnable,
          label: t('Check For Updates'),
          click: () => {
            this.autoAppUpdate.forceCheck();
          },
        },
        {
          visible: this.appUpdaterEnable,
          label: t('Install Update from File…'),
          click: () => {
            this.autoAppUpdate.installFromFile();
          },
        },
        { type: 'separator' },
        {
          label: t('Hide {app}', { app: APP_NAME }),
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: t('Hide Others'),
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: t('Show All'), selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: t('Quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit = {
      label: t('Edit'),
      submenu: [
        {
          label: t('Undo'),
          accelerator: 'Command+Z',
          selector: 'undo:',
          role: 'undo',
        },
        {
          label: t('Redo'),
          accelerator: 'Command+Y',
          selector: 'redo:',
          role: 'redo',
        },
        { type: 'separator' },
        {
          label: t('Cut'),
          accelerator: 'Command+X',
          selector: 'cut:',
          role: 'cut',
        },
        {
          label: t('Copy'),
          accelerator: 'Command+C',
          selector: 'copy:',
          role: 'copy',
        },
        {
          label: t('Paste'),
          accelerator: 'Command+V',
          selector: 'paste:',
          role: 'paste',
        },
        {
          label: t('Select All'),
          accelerator: 'Command+A',
          selector: 'selectAll:',
          role: 'selectAll',
        },
      ],
    };
    const subMenuViewDev = {
      label: t('View'),
      submenu: [
        {
          label: t('Reload'),
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: t('Toggle Full Screen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: t('Toggle Developer Tools'),
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd = {
      label: t('View'),
      submenu: [
        {
          label: t('Toggle Full Screen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow = {
      label: t('Window'),
      submenu: [
        {
          label: t('Minimize'),
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        {
          label: t('Close'),
          accelerator: 'Command+W',
          selector: 'performClose:',
        },
        { type: 'separator' },
        { label: t('Bring All To Front'), selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp = {
      label: t('Help'),
      submenu: [
        {
          label: t('Report Bugs'),
          click: () => {
            reportBugsWindow();
          },
        },
        {
          label: t('Keyboard Shortcuts'),
          click: () => {
            keyboardShortcutsWindow();
          },
        },
        {
          label: t('New Features And Updates'),
          click: () => {
            appFeaturesWindow();
          },
        },
        {
          label: t('Privacy Policy'),
          click: () => {
            privacyPolicyWindow();
          },
        },
        {
          label: t('Buy Me A Coffee!'),
          click: () => {
            openExternalUrl(BUY_ME_A_COFFEE_URL);
          },
        },
        {
          label: t('Invite A Friend'),
          click: () => {
            openExternalUrl(inviteViaEmail);
          },
        },
        {
          label: t('Find Us On GitHub'),
          click: () => {
            openExternalUrl(APP_GITHUB_URL);
          },
        },
      ],
    };

    const subMenuView = ENV_FLAVOR.allowDevelopmentEnvironment
      ? subMenuViewDev
      : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    return [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu: ENV_FLAVOR.allowDevelopmentEnvironment
          ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.toggleDevTools();
                },
              },
            ]
          : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
            ],
      },
      {
        label: 'Help',
        submenu: [
          {
            visible: this.appUpdaterEnable,
            label: 'Check For Updates',
            click: () => {
              this.autoAppUpdate.forceCheck();
            },
          },
          {
            label: 'Report Bugs',
            click: () => {
              reportBugsWindow();
            },
          },
          {
            label: 'Keyboard Shortcuts',
            click: () => {
              keyboardShortcutsWindow();
            },
          },
          {
            label: 'New Features And Updates',
            click: () => {
              appFeaturesWindow();
            },
          },
          {
            label: 'Privacy Policy',
            click: () => {
              privacyPolicyWindow();
            },
          },
          {
            label: 'Buy Me A Coffee!',
            click: () => {
              openExternalUrl(BUY_ME_A_COFFEE_URL);
            },
          },
          {
            label: `Invite A Friend`,
            click: () => {
              openExternalUrl(inviteViaEmail);
            },
          },
          {
            label: 'Find Us On GitHub',
            click: () => {
              openExternalUrl(APP_GITHUB_URL);
            },
          },
        ],
      },
    ];
  }
}
