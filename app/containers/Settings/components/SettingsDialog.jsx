import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';
import electronIs from 'electron-is';
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { DEVICES_LABEL } from '../../../constants';
import SettingsDialogTabContainer from './SettingsDialogTabContainer';
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
        maxWidth="sm"
        aria-labelledby="settings-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() =>
          onDialogBoxCloseBtnClick({
            confirm: false,
          })
        }
      >
        <Typography variant="h5" className={styles.title}>
          {t('Settings')}
        </Typography>
        <DialogContent>
          <Tabs
            className={styles.tabHeadingWrapper}
            value={tabIndex}
            onChange={this._handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {this.shoudThisTabHeadRender(0) && (
              <Tab label={t('General')} className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(1) && (
              <Tab label={t('File Manager')} className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(2) && (
              <Tab label={t('Updates')} className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(3) && (
              <Tab label={t('Privacy')} className={styles.tab} />
            )}
          </Tabs>

          {/* ----- General Tab ----- */}
          <FormControl component="fieldset" className={styles.fieldset}>
            {tabIndex === this.tabBodyRenderTabIndex(0) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <FormControl className={styles.languageControl}>
                      <InputLabel id="app-language-label">
                        {t('Language')}
                      </InputLabel>
                      <Select
                        labelId="app-language-label"
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
                    </FormControl>

                    <FormControl className={styles.fontControl}>
                      <InputLabel id="app-font-family-label">
                        {t('Interface font')}
                      </InputLabel>
                      <Select
                        labelId="app-font-family-label"
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
                      <FormHelperText>
                        {t('Choose the typeface used throughout the app.')}
                      </FormHelperText>
                    </FormControl>

                    <div
                      className={styles.fontPreview}
                      style={{ fontFamily: getAppFontFamily(appFontFamily) }}
                    >
                      <span className={styles.fontPreviewLabel}>
                        {t('Font preview')}
                      </span>
                      <span>{t('Mac, phone, folders and files')}</span>
                    </div>

                    <Typography variant="subtitle2" className={styles.subtitle}>
                      {t('Theme')}
                    </Typography>
                    <RadioGroup
                      aria-label="app-theme-mode"
                      name="app-theme-mode"
                      value={appThemeMode}
                      onChange={onAppThemeModeChange}
                    >
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.light}
                        control={<Radio />}
                        label={t('Light')}
                      />
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.dark}
                        control={<Radio />}
                        label={t('Dark')}
                      />
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.auto}
                        control={<Radio />}
                        label={t('Auto')}
                      />
                    </RadioGroup>

                    {showMtpModeSelection && (
                      <>
                        <Typography
                          variant="subtitle2"
                          className={`${styles.subtitle}  ${styles.fmSettingsStylesFix}`}
                        >
                          {t('MTP Mode')}
                        </Typography>
                        <RadioGroup
                          aria-label="app-theme-mode"
                          name="app-theme-mode"
                          value={mtpMode}
                          onChange={(e, value) =>
                            onMtpModeChange(e, value, DEVICE_TYPE.mtp)
                          }
                        >
                          <FormControlLabel
                            value={MTP_MODE.kalam}
                            control={<Radio />}
                            label={capitalize(MTP_MODE.kalam)}
                          />
                          <FormControlLabel
                            value={MTP_MODE.legacy}
                            control={<Radio />}
                            label={capitalize(MTP_MODE.legacy)}
                          />
                        </RadioGroup>
                      </>
                    )}

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('Enable auto device detection (USB Hotplug)')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableUsbHotplug}
                          onChange={(e) =>
                            onEnableUsbHotplug(e, !enableUsbHotplug)
                          }
                        />
                      }
                      label={t(enableUsbHotplug ? 'Enabled' : 'Disabled')}
                    />
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}

            {/* ----- File Manager Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(1) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      {t('Show hidden files')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={!hideHiddenFilesLocal}
                          onChange={(e) =>
                            onHiddenFilesChange(
                              e,
                              !hideHiddenFilesLocal,
                              DEVICE_TYPE.local
                            )
                          }
                        />
                      }
                      label={t(DEVICES_LABEL[DEVICE_TYPE.local])}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={!hideHiddenFilesMtp}
                          onChange={(e) =>
                            onHiddenFilesChange(
                              e,
                              !hideHiddenFilesMtp,
                              DEVICE_TYPE.mtp
                            )
                          }
                        />
                      }
                      label={t(DEVICES_LABEL[DEVICE_TYPE.mtp])}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('View as grid')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeLocalGrid}
                          onChange={(e) =>
                            onFileExplorerListingType(
                              e,
                              fileExplorerListingTypeLocalGrid
                                ? FILE_EXPLORER_VIEW_TYPE.list
                                : FILE_EXPLORER_VIEW_TYPE.grid,
                              DEVICE_TYPE.local
                            )
                          }
                        />
                      }
                      label={t(DEVICES_LABEL[DEVICE_TYPE.local])}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeMtpGrid}
                          onChange={(e) =>
                            onFileExplorerListingType(
                              e,
                              fileExplorerListingTypeMtpGrid
                                ? FILE_EXPLORER_VIEW_TYPE.list
                                : FILE_EXPLORER_VIEW_TYPE.grid,
                              DEVICE_TYPE.mtp
                            )
                          }
                        />
                      }
                      label={t(DEVICES_LABEL[DEVICE_TYPE.mtp])}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t(
                        'Display overall progress on the file transfer screen'
                      )}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={
                            filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.download
                            ]
                          }
                          onChange={(e) =>
                            onFilesPreprocessingBeforeTransferChange(
                              e,
                              !filesPreprocessingBeforeTransfer[
                                FILE_TRANSFER_DIRECTION.download
                              ],
                              FILE_TRANSFER_DIRECTION.download
                            )
                          }
                        />
                      }
                      label={t('To {device}', {
                        device: t(DEVICES_LABEL[DEVICE_TYPE.local]),
                      })}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={
                            filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.upload
                            ]
                          }
                          onChange={(e) =>
                            onFilesPreprocessingBeforeTransferChange(
                              e,
                              !filesPreprocessingBeforeTransfer[
                                FILE_TRANSFER_DIRECTION.upload
                              ],
                              FILE_TRANSFER_DIRECTION.upload
                            )
                          }
                        />
                      }
                      label={t('To {device}', {
                        device: t(DEVICES_LABEL[DEVICE_TYPE.mtp]),
                      })}
                    />

                    {freshInstall ? (
                      <Paper
                        className={`${styles.onboardingPaper}`}
                        elevation={0}
                      >
                        <Typography
                          component="p"
                          className={`${styles.onboardingPaperBody}`}
                        >
                          <span className={`${styles.onboardingPaperBodyItem}`}>
                            &#9679;&nbsp;
                            {t('Use the toggles to enable or disable an item.')}
                          </span>
                          <span className={`${styles.onboardingPaperBodyItem}`}>
                            &#9679;&nbsp;{t('Scroll down for more Settings.')}
                          </span>
                        </Typography>
                      </Paper>
                    ) : null}

                    <Typography variant="caption">
                      {t(
                        'To calculate the overall transfer progress, files must be analyzed first. This can take from a few seconds to a few minutes.'
                      )}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('Show directories first')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showDirectoriesFirst}
                          onChange={(e) =>
                            onShowDirectoriesFirstChange(
                              e,
                              !showDirectoriesFirst
                            )
                          }
                        />
                      }
                      label={t(showDirectoriesFirst ? 'Enabled' : 'Disabled')}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('Show status bar')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableStatusBar}
                          onChange={(e) =>
                            onStatusBarChange(e, !enableStatusBar)
                          }
                        />
                      }
                      label={t(enableStatusBar ? 'Enabled' : 'Disabled')}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('Show Local Disk pane')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showLocalPane}
                          onChange={(e) =>
                            onShowLocalPaneChange(e, !showLocalPane)
                          }
                        />
                      }
                      label={t(showLocalPane ? 'Enabled' : 'Disabled')}
                    />
                    <Typography variant="caption">
                      {t(
                        'You can drag files from Finder to the phone pane, but not in the opposite direction.'
                      )}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      {t('Show Local Disk pane on the left side')}
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showLocalPaneOnLeftSide}
                          onChange={(e) =>
                            onShowLocalPaneOnLeftSideChange(
                              e,
                              !showLocalPaneOnLeftSide
                            )
                          }
                        />
                      }
                      label={t(
                        showLocalPaneOnLeftSide ? 'Enabled' : 'Disabled'
                      )}
                    />
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}

            {/* ----- Updates Tab ----- */}

            {tabIndex === this.tabBodyRenderTabIndex(2) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      {t('Automatically check for updates')}
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableAutoUpdateCheck}
                          onChange={(e) =>
                            onAutoUpdateCheckChange(e, !enableAutoUpdateCheck)
                          }
                        />
                      }
                      label={t(enableAutoUpdateCheck ? 'Enabled' : 'Disabled')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      {t(
                        'Automatically download the new updates when available (recommended)'
                      )}
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableBackgroundAutoUpdate}
                          disabled={!enableAutoUpdateCheck}
                          onChange={(e) =>
                            onEnableBackgroundAutoUpdateChange(
                              e,
                              !enableBackgroundAutoUpdate
                            )
                          }
                        />
                      }
                      label={t(
                        enableBackgroundAutoUpdate ? 'Enabled' : 'Disabled'
                      )}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.subtitleMarginFix}`}
                    >
                      {t('Enable beta update channel')}
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enablePrereleaseUpdates}
                          disabled={isPrereleaseVersion()}
                          onChange={(e) =>
                            onPrereleaseUpdatesChange(
                              e,
                              !enablePrereleaseUpdates
                            )
                          }
                        />
                      }
                      label={t(
                        enablePrereleaseUpdates ? 'Enabled' : 'Disabled'
                      )}
                    />
                  </FormGroup>
                  <Typography variant="caption">
                    {t(
                      'Preview upcoming features. Beta versions may be less stable.'
                    )}
                  </Typography>
                </div>
              </SettingsDialogTabContainer>
            )}

            {/* ----- Privacy Tab ----- */}

            {tabIndex === this.tabBodyRenderTabIndex(3) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      {t('Enable anonymous usage statistics gathering')}
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableAnalytics}
                          onChange={(e) =>
                            onAnalyticsChange(e, !enableAnalytics)
                          }
                        />
                      }
                      label={t(enableAnalytics ? 'Enabled' : 'Disabled')}
                    />
                    <Typography variant="caption">
                      {t(
                        'We do not collect personal information or sell your data. Anonymous statistics help improve the app and fix bugs.'
                      )}
                      &nbsp;
                      <a
                        className={styles.a}
                        onClick={() => {
                          ipcRenderer.send(
                            IpcEvents.OPEN_HELP_PRIVACY_POLICY_WINDOW
                          );
                        }}
                      >
                        {t('Learn more…')}
                      </a>
                    </Typography>
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}
          </FormControl>

          <FormControl component="fieldset" className={styles.fieldset} />
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
