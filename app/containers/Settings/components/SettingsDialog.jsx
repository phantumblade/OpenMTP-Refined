import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';
import electronIs from 'electron-is';
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import { DEVICES_LABEL } from '../../../constants';
import {
  DEVICE_TYPE,
  FILE_EXPLORER_VIEW_TYPE,
  APP_THEME_MODE_TYPE,
  APP_LANGUAGE_TYPE,
  APP_FONT_FAMILY_TYPE,
  MTP_MODE,
  FILE_TRANSFER_DIRECTION,
} from '../../../enums';
import { capitalize, isPrereleaseVersion } from '../../../utils/funcs';
import { IpcEvents } from '../../../services/ipc-events/IpcEventType';
import { isKalamModeSupported } from '../../../helpers/binaries';
import { translate } from '../../../i18n';
import { getAppFontFamily } from '../../../helpers/fonts';

const isMas = electronIs.mas();

export default class SettingsDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
    };

    this.isMasHidePosition = 1;
  }

  _handleTabChange = (event, index) => {
    this.setState({
      tabIndex: index,
    });
  };

  shoudThisTabHeadRender = (position) => {
    return !(isMas && this.isMasHidePosition === position);
  };

  tabBodyRenderTabIndex = (position) => {
    if (isMas && this.isMasHidePosition === position) {
      return null;
    }

    if (isMas && position > this.isMasHidePosition) {
      return position - 1 < 1 ? 0 : position - 1;
    }

    return position;
  };

  // Section = icon in an M3 shape, title and a sentence explaining it, then
  // a segmented list of rows ("stacked" corners: large outside, small inside).
  renderSection = ({ icon, title, description, children, grouped = true }) => {
    const { styles } = this.props;

    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <M3Shape
            shape="Cookie9Sided"
            size={40}
            color="currentColor"
            className={styles.sectionShape}
          >
            <MaterialSymbol
              name={icon}
              size={22}
              fill={1}
              className={styles.sectionIcon}
            />
          </M3Shape>
          <div>
            <div className={styles.sectionTitle}>{title}</div>
            {description && (
              <div className={styles.sectionDescription}>{description}</div>
            )}
          </div>
        </div>
        {grouped ? <div className={styles.group}>{children}</div> : children}
      </section>
    );
  };

  renderRowContent = ({ icon, title, description }) => {
    const { styles } = this.props;

    return (
      <>
        <MaterialSymbol name={icon} size={24} className={styles.rowIcon} />
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{title}</span>
          {description && (
            <span className={styles.rowDescription}>{description}</span>
          )}
        </span>
      </>
    );
  };

  renderRow = ({ icon, title, description, control }) => {
    const { styles } = this.props;

    return (
      <div className={styles.row}>
        {this.renderRowContent({ icon, title, description })}
        {control && <span className={styles.rowControl}>{control}</span>}
      </div>
    );
  };

  // the whole row is the label, so clicking anywhere toggles the switch
  renderSwitchRow = ({
    icon,
    title,
    description,
    checked,
    disabled,
    onChange,
  }) => {
    const { styles } = this.props;

    return (
      <label
        className={classNames(styles.row, styles.rowInteractive, {
          [styles.rowDisabled]: disabled,
        })}
      >
        {this.renderRowContent({ icon, title, description })}
        <span className={styles.rowControl}>
          <Switch checked={!!checked} disabled={disabled} onChange={onChange} />
        </span>
      </label>
    );
  };

  renderRadioRow = ({ icon, value, title, description }) => {
    const { styles } = this.props;

    return (
      <label className={classNames(styles.row, styles.rowInteractive)}>
        {this.renderRowContent({ icon, title, description })}
        <span className={styles.rowControl}>
          <Radio value={value} />
        </span>
      </label>
    );
  };

  render() {
    const {
      open,
      freshInstall,
      hideHiddenFiles,
      fileExplorerListingType,
      appThemeMode,
      appLanguage,
      appFontFamily,
      styles,
      enableAutoUpdateCheck,
      enableBackgroundAutoUpdate,
      enablePrereleaseUpdates,
      enableAnalytics,
      enableStatusBar,
      showLocalPane,
      showLocalPaneOnLeftSide,
      showDirectoriesFirst,
      mtpMode,
      filesPreprocessingBeforeTransfer,
      onAnalyticsChange,
      onHiddenFilesChange,
      onFileExplorerListingType,
      onDialogBoxCloseBtnClick,
      onAutoUpdateCheckChange,
      onEnableBackgroundAutoUpdateChange,
      onPrereleaseUpdatesChange,
      onStatusBarChange,
      onAppThemeModeChange,
      onAppLanguageChange,
      onAppFontFamilyChange,
      onShowLocalPaneChange,
      onShowLocalPaneOnLeftSideChange,
      onShowDirectoriesFirstChange,
      onMtpModeChange,
      onFilesPreprocessingBeforeTransferChange,
      onEnableUsbHotplug,
      enableUsbHotplug,
    } = this.props;

    const { tabIndex } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);

    const hideHiddenFilesLocal = hideHiddenFiles[DEVICE_TYPE.local];
    const hideHiddenFilesMtp = hideHiddenFiles[DEVICE_TYPE.mtp];

    const fileExplorerListingTypeLocalGrid =
      fileExplorerListingType[DEVICE_TYPE.local] ===
      FILE_EXPLORER_VIEW_TYPE.grid;
    const fileExplorerListingTypeMtpGrid =
      fileExplorerListingType[DEVICE_TYPE.mtp] === FILE_EXPLORER_VIEW_TYPE.grid;

    const showMtpModeSelection = isKalamModeSupported();

    return (
      <Dialog
        open={open}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.dialogPaper }}
        aria-labelledby="settings-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() =>
          onDialogBoxCloseBtnClick({
            confirm: false,
          })
        }
      >
        <h2 id="settings-dialogbox" className={styles.title}>
          {t('Settings')}
        </h2>
        <DialogContent className={styles.content}>
          <Tabs
            className={styles.tabHeadingWrapper}
            value={tabIndex}
            onChange={this._handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            TabIndicatorProps={{ children: <span /> }}
          >
            {this.shoudThisTabHeadRender(0) && (
              <Tab
                icon={<MaterialSymbol name="tune" size={24} />}
                label={t('General')}
              />
            )}
            {this.shoudThisTabHeadRender(1) && (
              <Tab
                icon={<MaterialSymbol name="folder_open" size={24} />}
                label={t('File Manager')}
              />
            )}
            {this.shoudThisTabHeadRender(2) && (
              <Tab
                icon={<MaterialSymbol name="system_update_alt" size={24} />}
                label={t('Updates')}
              />
            )}
            {this.shoudThisTabHeadRender(3) && (
              <Tab
                icon={<MaterialSymbol name="privacy_tip" size={24} />}
                label={t('Privacy')}
              />
            )}
          </Tabs>

          <div className={styles.tabContainer}>
            {/* ----- General Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(0) && (
              <>
                {this.renderSection({
                  icon: 'translate',
                  title: t('Language and font'),
                  description: t('How the app talks to you and looks.'),
                  children: (
                    <>
                      {this.renderRow({
                        icon: 'language',
                        title: t('Language'),
                        control: (
                          <Select
                            variant="outlined"
                            className={styles.rowSelect}
                            value={appLanguage}
                            onChange={(event) =>
                              onAppLanguageChange(event, event.target.value)
                            }
                          >
                            <MenuItem value={APP_LANGUAGE_TYPE.english}>
                              {t('English')}
                            </MenuItem>
                            <MenuItem value={APP_LANGUAGE_TYPE.italian}>
                              {t('Italian')}
                            </MenuItem>
                          </Select>
                        ),
                      })}
                      {this.renderRow({
                        icon: 'text_fields',
                        title: t('Interface font'),
                        description: t(
                          'Choose the typeface used throughout the app.'
                        ),
                        control: (
                          <Select
                            variant="outlined"
                            className={styles.rowSelect}
                            value={appFontFamily}
                            onChange={(event) =>
                              onAppFontFamilyChange(event, event.target.value)
                            }
                          >
                            <MenuItem value={APP_FONT_FAMILY_TYPE.system}>
                              {t('System default (recommended)')}
                            </MenuItem>
                            <MenuItem
                              value={APP_FONT_FAMILY_TYPE.facultyGlyphic}
                              style={{
                                fontFamily: getAppFontFamily(
                                  APP_FONT_FAMILY_TYPE.facultyGlyphic
                                ),
                              }}
                            >
                              Faculty Glyphic
                            </MenuItem>
                          </Select>
                        ),
                      })}
                      {this.renderRow({
                        icon: 'text_format',
                        title: t('Font preview'),
                        description: (
                          <span
                            className={styles.fontPreview}
                            style={{
                              fontFamily: getAppFontFamily(appFontFamily),
                            }}
                          >
                            {t('Mac, phone, folders and files')}
                          </span>
                        ),
                      })}
                    </>
                  ),
                })}

                {this.renderSection({
                  icon: 'palette',
                  title: t('Theme'),
                  description: t('Light, dark or following macOS.'),
                  children: (
                    <RadioGroup
                      className={styles.group}
                      value={appThemeMode}
                      onChange={onAppThemeModeChange}
                    >
                      {this.renderRadioRow({
                        icon: 'light_mode',
                        value: APP_THEME_MODE_TYPE.light,
                        title: t('Light'),
                      })}
                      {this.renderRadioRow({
                        icon: 'dark_mode',
                        value: APP_THEME_MODE_TYPE.dark,
                        title: t('Dark'),
                      })}
                      {this.renderRadioRow({
                        icon: 'brightness_auto',
                        value: APP_THEME_MODE_TYPE.auto,
                        title: t('Auto'),
                        description: t('Follows the macOS appearance.'),
                      })}
                    </RadioGroup>
                  ),
                  grouped: false,
                })}

                {this.renderSection({
                  icon: 'usb',
                  title: t('Phone connection'),
                  description: t(
                    'How OpenMTP talks to Android phones over USB.'
                  ),
                  children: (
                    <>
                      {showMtpModeSelection && (
                        <RadioGroup
                          className={styles.group}
                          value={mtpMode}
                          onChange={(e, value) =>
                            onMtpModeChange(e, value, DEVICE_TYPE.mtp)
                          }
                        >
                          {this.renderRadioRow({
                            icon: 'bolt',
                            value: MTP_MODE.kalam,
                            title: capitalize(MTP_MODE.kalam),
                            description: t(
                              'Recommended: faster and more reliable.'
                            ),
                          })}
                          {this.renderRadioRow({
                            icon: 'history',
                            value: MTP_MODE.legacy,
                            title: capitalize(MTP_MODE.legacy),
                            description: t('Older engine, for compatibility.'),
                          })}
                        </RadioGroup>
                      )}
                      <div className={styles.group}>
                        {this.renderSwitchRow({
                          icon: 'cable',
                          title: t(
                            'Enable auto device detection (USB Hotplug)'
                          ),
                          description: t(
                            'Connects to the phone as soon as you plug in the cable.'
                          ),
                          checked: enableUsbHotplug,
                          onChange: (e) =>
                            onEnableUsbHotplug(e, !enableUsbHotplug),
                        })}
                      </div>
                    </>
                  ),
                  grouped: false,
                })}
              </>
            )}

            {/* ----- File Manager Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(1) && (
              <>
                {this.renderSection({
                  icon: 'visibility',
                  title: t('Show hidden files'),
                  description: t(
                    'Files whose name starts with a dot, usually system files.'
                  ),
                  children: (
                    <>
                      {this.renderSwitchRow({
                        icon: 'laptop_mac',
                        title: t(DEVICES_LABEL[DEVICE_TYPE.local]),
                        checked: !hideHiddenFilesLocal,
                        onChange: (e) =>
                          onHiddenFilesChange(
                            e,
                            !hideHiddenFilesLocal,
                            DEVICE_TYPE.local
                          ),
                      })}
                      {this.renderSwitchRow({
                        icon: 'mobile',
                        title: t(DEVICES_LABEL[DEVICE_TYPE.mtp]),
                        checked: !hideHiddenFilesMtp,
                        onChange: (e) =>
                          onHiddenFilesChange(
                            e,
                            !hideHiddenFilesMtp,
                            DEVICE_TYPE.mtp
                          ),
                      })}
                    </>
                  ),
                })}

                {this.renderSection({
                  icon: 'grid_view',
                  title: t('View as grid'),
                  description: t(
                    'Large icons in a grid instead of a detailed list.'
                  ),
                  children: (
                    <>
                      {this.renderSwitchRow({
                        icon: 'laptop_mac',
                        title: t(DEVICES_LABEL[DEVICE_TYPE.local]),
                        checked: fileExplorerListingTypeLocalGrid,
                        onChange: (e) =>
                          onFileExplorerListingType(
                            e,
                            fileExplorerListingTypeLocalGrid
                              ? FILE_EXPLORER_VIEW_TYPE.list
                              : FILE_EXPLORER_VIEW_TYPE.grid,
                            DEVICE_TYPE.local
                          ),
                      })}
                      {this.renderSwitchRow({
                        icon: 'mobile',
                        title: t(DEVICES_LABEL[DEVICE_TYPE.mtp]),
                        checked: fileExplorerListingTypeMtpGrid,
                        onChange: (e) =>
                          onFileExplorerListingType(
                            e,
                            fileExplorerListingTypeMtpGrid
                              ? FILE_EXPLORER_VIEW_TYPE.list
                              : FILE_EXPLORER_VIEW_TYPE.grid,
                            DEVICE_TYPE.mtp
                          ),
                      })}
                    </>
                  ),
                })}

                {this.renderSection({
                  icon: 'view_column',
                  title: t('Layout'),
                  description: t('What the file panes show and where.'),
                  children: (
                    <>
                      {this.renderSwitchRow({
                        icon: 'folder',
                        title: t('Show directories first'),
                        checked: showDirectoriesFirst,
                        onChange: (e) =>
                          onShowDirectoriesFirstChange(
                            e,
                            !showDirectoriesFirst
                          ),
                      })}
                      {this.renderSwitchRow({
                        icon: 'dock_to_bottom',
                        title: t('Show status bar'),
                        description: t(
                          'Item counts and selection at the bottom of each pane.'
                        ),
                        checked: enableStatusBar,
                        onChange: (e) => onStatusBarChange(e, !enableStatusBar),
                      })}
                      {this.renderSwitchRow({
                        icon: 'laptop_mac',
                        title: t('Show Local Disk pane'),
                        description: t(
                          'You can drag files from Finder to the phone pane, but not in the opposite direction.'
                        ),
                        checked: showLocalPane,
                        onChange: (e) =>
                          onShowLocalPaneChange(e, !showLocalPane),
                      })}
                      {this.renderSwitchRow({
                        icon: 'align_horizontal_left',
                        title: t('Show Local Disk pane on the left side'),
                        checked: showLocalPaneOnLeftSide,
                        onChange: (e) =>
                          onShowLocalPaneOnLeftSideChange(
                            e,
                            !showLocalPaneOnLeftSide
                          ),
                      })}
                    </>
                  ),
                })}

                {this.renderSection({
                  icon: 'swap_horiz',
                  title: t(
                    'Display overall progress on the file transfer screen'
                  ),
                  description: t(
                    'To calculate the overall transfer progress, files must be analyzed first. This can take from a few seconds to a few minutes.'
                  ),
                  children: (
                    <>
                      {this.renderSwitchRow({
                        icon: 'laptop_mac',
                        title: t('To {device}', {
                          device: t(DEVICES_LABEL[DEVICE_TYPE.local]),
                        }),
                        checked:
                          filesPreprocessingBeforeTransfer[
                            FILE_TRANSFER_DIRECTION.download
                          ],
                        onChange: (e) =>
                          onFilesPreprocessingBeforeTransferChange(
                            e,
                            !filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.download
                            ],
                            FILE_TRANSFER_DIRECTION.download
                          ),
                      })}
                      {this.renderSwitchRow({
                        icon: 'mobile',
                        title: t('To {device}', {
                          device: t(DEVICES_LABEL[DEVICE_TYPE.mtp]),
                        }),
                        checked:
                          filesPreprocessingBeforeTransfer[
                            FILE_TRANSFER_DIRECTION.upload
                          ],
                        onChange: (e) =>
                          onFilesPreprocessingBeforeTransferChange(
                            e,
                            !filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.upload
                            ],
                            FILE_TRANSFER_DIRECTION.upload
                          ),
                      })}
                    </>
                  ),
                })}

                {freshInstall ? (
                  <div className={styles.tipCard}>
                    <MaterialSymbol name="lightbulb" size={20} fill={1} />
                    <span>
                      {t('Use the toggles to enable or disable an item.')}{' '}
                      {t('Scroll down for more Settings.')}
                    </span>
                  </div>
                ) : null}
              </>
            )}

            {/* ----- Updates Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(2) &&
              this.renderSection({
                icon: 'system_update_alt',
                title: t('Updates'),
                description: t('Keep OpenMTP up to date automatically.'),
                children: (
                  <>
                    {this.renderSwitchRow({
                      icon: 'update',
                      title: t('Automatically check for updates'),
                      checked: enableAutoUpdateCheck,
                      onChange: (e) =>
                        onAutoUpdateCheckChange(e, !enableAutoUpdateCheck),
                    })}
                    {this.renderSwitchRow({
                      icon: 'download',
                      title: t(
                        'Automatically download the new updates when available (recommended)'
                      ),
                      checked: enableBackgroundAutoUpdate,
                      disabled: !enableAutoUpdateCheck,
                      onChange: (e) =>
                        onEnableBackgroundAutoUpdateChange(
                          e,
                          !enableBackgroundAutoUpdate
                        ),
                    })}
                    {this.renderSwitchRow({
                      icon: 'science',
                      title: t('Enable beta update channel'),
                      description: t(
                        'Preview upcoming features. Beta versions may be less stable.'
                      ),
                      checked: enablePrereleaseUpdates,
                      disabled: isPrereleaseVersion(),
                      onChange: (e) =>
                        onPrereleaseUpdatesChange(e, !enablePrereleaseUpdates),
                    })}
                  </>
                ),
              })}

            {/* ----- Privacy Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(3) &&
              this.renderSection({
                icon: 'policy',
                title: t('Privacy'),
                description: t(
                  'We do not collect personal information or sell your data. Anonymous statistics help improve the app and fix bugs.'
                ),
                children: this.renderSwitchRow({
                  icon: 'analytics',
                  title: t('Enable anonymous usage statistics gathering'),
                  description: (
                    <a
                      className={styles.link}
                      onClick={(event) => {
                        event.preventDefault();
                        ipcRenderer.send(
                          IpcEvents.OPEN_HELP_PRIVACY_POLICY_WINDOW
                        );
                      }}
                    >
                      {t('Learn more…')}
                    </a>
                  ),
                  checked: enableAnalytics,
                  onChange: (e) => onAnalyticsChange(e, !enableAnalytics),
                }),
              })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              onDialogBoxCloseBtnClick({
                confirm: false,
              })
            }
            color="primary"
            className={classNames(styles.btnPositive)}
          >
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
