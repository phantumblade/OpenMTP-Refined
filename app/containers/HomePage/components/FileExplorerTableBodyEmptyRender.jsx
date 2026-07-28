import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import UsbIcon from '@material-ui/icons/Usb';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import RefreshIcon from '@material-ui/icons/Refresh';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { styles } from '../styles/FileExplorerTableBodyEmptyRender';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { IpcEvents } from '../../../services/ipc-events/IpcEventType';
import { findUsbConflictingApps } from '../../../utils/process';
import { translate } from '../../../i18n';

class FileExplorerTableBodyEmptyRender extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      conflictingApps: [],
      isCheckingConflicts: false,
    };
  }

  componentDidMount() {
    this._handleCheckConflictingApps();
  }

  _handleCheckConflictingApps = async () => {
    this.setState({ isCheckingConflicts: true });

    const conflictingApps = await findUsbConflictingApps();

    this.setState({
      conflictingApps,
      isCheckingConflicts: false,
    });
  };

  _handleTryConnection = async () => {
    const { onTryConnection } = this.props;

    await this._handleCheckConflictingApps();
    onTryConnection();
  };

  _handleHelpPhoneNotRecognizedBtn = () => {
    ipcRenderer.send(IpcEvents.OPEN_HELP_PHONE_NOT_CONNECTING_WINDOW);
    analyticsService.sendEvent(
      EVENT_TYPE.MTP_HELP_PHONE_NOT_CONNECTED_DIALOG_OPEN,
      {}
    );
  };

  _connectionDetail = (t) => {
    const { mtpDevice } = this.props;
    const error = String(mtpDevice?.error || '');

    if (!error) {
      return null;
    }

    if (/LIBUSB_ERROR_NOT_FOUND/i.test(error)) {
      return t(
        'The USB device disappeared during connection. Check the cable and USB mode on the phone.'
      );
    }

    if (/ErrorMtpDetectFailed/i.test(error)) {
      return t(
        'No MTP phone was detected. Check the USB mode and allow data access on Android.'
      );
    }

    if (/ErrorDeviceSetup/i.test(error)) {
      return t(
        'An error occurred while initializing the device. Unlock the phone and reconnect the USB cable.'
      );
    }

    if (/ErrorDeviceLocked/i.test(error)) {
      return t('Unlock your Phone and refresh again');
    }

    if (/ErrorMtpLockExists/i.test(error)) {
      return t(
        'Operation in progress. Please wait for the current task to finish.'
      );
    }

    if (/busy|claim|access|LIBUSB_ERROR_ACCESS/i.test(error)) {
      return t('Another app may already be using the phone USB connection.');
    }

    return t(error);
  };

  render() {
    const {
      classes: styles,
      mtpDevice,
      isMtp,
      currentBrowsePath,
      deviceType,
      directoryLists,
      onContextMenuClick,
      appLanguage,
    } = this.props;
    const { conflictingApps, isCheckingConflicts } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const connectionDetail = this._connectionDetail(t);
    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType],
    };

    if (isMtp && !mtpDevice.isAvailable) {
      const conflictText =
        conflictingApps.length > 0
          ? t('Potential conflicts currently running: {apps}', {
              apps: conflictingApps.map((appName) => t(appName)).join(', '),
            })
          : t('No known conflicting apps are currently running');

      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <div className={styles.emptyPaneContainer}>
              <div className={styles.contentWrapper}>
                <div className={styles.phoneIconBadge}>
                  <PhoneAndroidIcon />
                </div>

                <Typography className={styles.title}>
                  {t('Connect your Android phone')}
                </Typography>
                <Typography className={styles.subtitle}>
                  {mtpDevice.isLoading
                    ? t('Checking USB connection…')
                    : t(
                        'Connect your phone via USB and select File Transfer (MTP) mode.'
                      )}
                </Typography>

                <div className={styles.actionsRow}>
                  <Button
                    disableElevation
                    className={styles.primaryBtn}
                    startIcon={<RefreshIcon />}
                    onClick={this._handleTryConnection}
                    disabled={mtpDevice.isLoading || isCheckingConflicts}
                  >
                    {t('Try connection again')}
                  </Button>
                  <Button
                    disableRipple
                    className={styles.secondaryLinkBtn}
                    onClick={this._handleHelpPhoneNotRecognizedBtn}
                  >
                    {t('Open connection guide')}
                    <OpenInNewIcon />
                  </Button>
                </div>

                {connectionDetail ? (
                  <div className={styles.diagnosticAlert}>
                    <ErrorOutlineIcon />
                    <div>{connectionDetail}</div>
                  </div>
                ) : conflictingApps.length > 0 ? (
                  <div className={styles.conflictWarningAlert}>
                    <ErrorOutlineIcon />
                    <div>{conflictText}</div>
                  </div>
                ) : (
                  <div className={styles.conflictSuccessAlert}>
                    <CheckCircleOutlineIcon />
                    <div>
                      {t('No known conflicting apps are currently running')}
                    </div>
                  </div>
                )}

                <div className={styles.stepsGrid}>
                  <div className={styles.stepItem}>
                    <div className={styles.stepIconBadge}>
                      <UsbIcon />
                    </div>
                    <div>
                      <div className={styles.stepTitle}>
                        {t('Data-capable USB Cable')}
                      </div>
                      <div className={styles.stepDesc}>
                        {t('Avoid charge-only USB cables.')}
                      </div>
                    </div>
                  </div>

                  <div className={styles.stepItem}>
                    <div className={styles.stepIconBadge}>
                      <LockOpenIcon />
                    </div>
                    <div>
                      <div className={styles.stepTitle}>
                        {t('Unlock Screen & Keep Active')}
                      </div>
                      <div className={styles.stepDesc}>
                        {t('Keep the phone screen unlocked.')}
                      </div>
                    </div>
                  </div>

                  <div className={styles.stepItem}>
                    <div className={styles.stepIconBadge}>
                      <TouchAppIcon />
                    </div>
                    <div>
                      <div className={styles.stepTitle}>
                        {t('Select File Transfer (MTP)')}
                      </div>
                      <div className={styles.stepDesc}>
                        {t('Open USB notification on Android.')}
                      </div>
                    </div>
                  </div>

                  <div className={styles.stepItem}>
                    <div className={styles.stepIconBadge}>
                      <RefreshIcon />
                    </div>
                    <div>
                      <div className={styles.stepTitle}>
                        {t('Allow Access & Try Again')}
                      </div>
                      <div className={styles.stepDesc}>
                        {t('Accept data permission on Android and retry.')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow className={styles.emptyTableRowWrapper}>
        <TableCell
          colSpan={6}
          className={styles.tableCell}
          onContextMenu={(event) =>
            onContextMenuClick(event, {}, { ...tableData }, 'emptyRowTarget')
          }
        />
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyEmptyRender);
