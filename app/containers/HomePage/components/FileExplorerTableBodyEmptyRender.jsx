import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import classNames from 'classnames';
import AngryFaceAnimation from '../../../components/m3/AngryFaceAnimation';
import M3Button from '../../../components/m3/M3Button';
import M3MorphingHero from '../../../components/m3/M3MorphingHero';
import StableText from '../../../components/m3/StableText';
import M3Shape from '../../../components/m3/M3Shape';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { styles } from '../styles/FileExplorerTableBodyEmptyRender';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { IpcEvents } from '../../../services/ipc-events/IpcEventType';
import {
  describeProcess,
  getPhoneUsbStatus,
  isReleasableOwner,
  quitBlockingProcess,
} from '../../../helpers/usbOwners';
import { translate } from '../../../i18n';
import { describeMtpError } from '../../../helpers/mtpErrorMessages';

// after this long without an answer the phone is most likely locked
const SLOW_CONNECTION_HINT_SECONDS = 8;

const CONNECTION_STEPS = [
  {
    symbol: 'usb',
    shape: 'Circle',
    avatar: 'avatarPrimary',
    title: 'Data-capable USB Cable',
    description: 'Avoid charge-only USB cables.',
  },
  {
    symbol: 'lock_open_right',
    shape: 'Cookie9Sided',
    avatar: 'avatarTertiary',
    title: 'Unlock Screen & Keep Active',
    description: 'Keep the phone screen unlocked.',
  },
  {
    symbol: 'touch_app',
    shape: 'Sunny',
    avatar: 'avatarSecondary',
    title: 'Select File Transfer (MTP)',
    description: 'Open USB notification on Android.',
  },
  {
    symbol: 'verified_user',
    shape: 'Cookie4Sided',
    avatar: 'avatarFixed',
    title: 'Allow Access & Try Again',
    description: 'Accept data permission on Android and retry.',
  },
];

class FileExplorerTableBodyEmptyRender extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // null until the first USB check finished
      phonesOnUsb: null,
      blockers: [],
      quittingPid: null,
      quitFailedName: null,
      connectingSeconds: 0,
    };
  }

  componentDidMount() {
    this._syncUsbPolling();
    this._syncConnectingTimer();
  }

  componentDidUpdate(prevProps) {
    const { mtpDevice } = this.props;

    this._syncUsbPolling();
    this._syncConnectingTimer();

    if (prevProps.mtpDevice?.isLoading && !mtpDevice?.isLoading) {
      this._handleCheckUsbStatus();
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
    this._stopUsbPolling();

    if (this._connectingTimer) {
      clearInterval(this._connectingTimer);
    }
  }

  // ticks once a second while connecting, so a slow attempt can explain
  // itself instead of spinning silently
  _syncConnectingTimer = () => {
    const { mtpDevice } = this.props;

    if (mtpDevice?.isLoading) {
      if (!this._connectingTimer) {
        this._connectingStartedAt = Date.now();
        this._connectingTimer = setInterval(() => {
          this.setState({
            connectingSeconds: Math.floor(
              (Date.now() - this._connectingStartedAt) / 1000
            ),
          });
        }, 1000);
      }
    } else if (this._connectingTimer) {
      clearInterval(this._connectingTimer);
      this._connectingTimer = null;
      this.setState({ connectingSeconds: 0 });
    }
  };

  _isShowingPhoneHelp = () => {
    const { isMtp, mtpDevice } = this.props;

    return isMtp && !mtpDevice?.isAvailable;
  };

  // While the phone isn't connected, keep checking which process (if any)
  // holds it, so plugging/unplugging or closing an app updates the hints live.
  _syncUsbPolling = () => {
    if (this._isShowingPhoneHelp()) {
      if (!this._usbPollTimer) {
        this._handleCheckUsbStatus();
        this._usbPollTimer = setInterval(this._handleCheckUsbStatus, 3000);
      }
    } else {
      this._stopUsbPolling();
    }
  };

  _stopUsbPolling = () => {
    if (this._usbPollTimer) {
      clearInterval(this._usbPollTimer);
      this._usbPollTimer = null;
    }
  };

  _handleCheckUsbStatus = async () => {
    if (this._isCheckingUsb) {
      return;
    }

    const { mtpDevice } = this.props;

    // the USB device is reset and re-enumerated while connecting: its state
    // is meaningless until the attempt ends
    if (mtpDevice?.isLoading) {
      return;
    }

    this._isCheckingUsb = true;

    try {
      const { phones, blockers } = await getPhoneUsbStatus();
      // ptpcamerad is freed automatically right before connecting, so it is
      // not something the user has to act on
      const describedBlockers = await Promise.all(
        blockers
          .filter((owner) => !isReleasableOwner(owner))
          .map(async (owner) => ({
            ...owner,
            releasable: false,
            displayName:
              (await describeProcess(owner.pid)).displayName || owner.name,
          }))
      );
      const next = {
        phonesOnUsb: phones.length,
        blockers: describedBlockers,
      };
      const signature = JSON.stringify([
        next.phonesOnUsb,
        next.blockers.map(({ pid }) => pid),
      ]);
      const { phonesOnUsb: shownPhones } = this.state;
      const isFirstCheck = shownPhones === null;

      // only change what is shown when two consecutive checks agree
      if (
        !this._unmounted &&
        (isFirstCheck || signature === this._lastUsbSignature)
      ) {
        this.setState(next);
      }

      this._lastUsbSignature = signature;
    } finally {
      this._isCheckingUsb = false;
    }
  };

  _handleTryConnection = () => {
    const { onTryConnection } = this.props;

    this.setState({ quitFailedName: null });
    onTryConnection();
  };

  _handleQuitBlocker = async (blocker) => {
    this.setState({ quittingPid: blocker.pid, quitFailedName: null });

    const hasQuit = await quitBlockingProcess(blocker);

    if (this._unmounted) {
      return;
    }

    this.setState({
      quittingPid: null,
      quitFailedName: hasQuit ? null : blocker.displayName,
    });

    await this._handleCheckUsbStatus();

    if (hasQuit) {
      this._handleTryConnection();
    }
  };

  _handleHelpPhoneNotRecognizedBtn = () => {
    ipcRenderer.send(IpcEvents.OPEN_HELP_PHONE_NOT_CONNECTING_WINDOW);
    analyticsService.sendEvent(
      EVENT_TYPE.MTP_HELP_PHONE_NOT_CONNECTED_DIALOG_OPEN,
      {}
    );
  };

  _connectionDetail = () => {
    const { mtpDevice } = this.props;

    return describeMtpError(mtpDevice?.error);
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
    const {
      phonesOnUsb,
      blockers,
      quittingPid,
      quitFailedName,
      connectingSeconds,
    } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const isConnecting = Boolean(mtpDevice?.isLoading);
    // a previous error is stale while a new attempt is running
    const connectionDetail = isConnecting ? null : this._connectionDetail();
    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType],
    };

    if (isMtp && !mtpDevice.isAvailable) {
      const noPhoneOnUsb = !isConnecting && phonesOnUsb === 0;
      const isBusy = isConnecting || quittingPid !== null;

      const errorCard = ({ key, visual, title, body, actions }) => (
        <div
          key={key}
          className={classNames(styles.statusCard, styles.statusError)}
        >
          {visual}
          <div className={styles.statusText}>
            <div className={styles.statusTitle}>{title}</div>
            {body && <div className={styles.statusBody}>{body}</div>}
            {actions && <div className={styles.statusActions}>{actions}</div>}
          </div>
        </div>
      );

      // the animated angry face is the visual for every connection problem
      const errorShape = () => (
        <AngryFaceAnimation
          size={72}
          className={styles.statusFace}
          aria-hidden="true"
        />
      );

      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <div className={styles.pane}>
              <div className={styles.layout}>
                <div className={styles.column}>
                  <div className={styles.hero}>
                    <M3MorphingHero
                      loading={isConnecting}
                      size={104}
                      aria-label={t('Connecting to your phone…')}
                    >
                      <MaterialSymbol
                        name="mobile"
                        size={48}
                        fill={1}
                        weight={500}
                        className={styles.heroIcon}
                      />
                    </M3MorphingHero>
                  </div>

                  <StableText
                    as="h2"
                    className={styles.headline}
                    active={isConnecting ? 1 : 0}
                    variants={[
                      t('Connect your Android phone'),
                      t('Connecting to your phone…'),
                    ]}
                  />
                  <StableText
                    as="p"
                    className={styles.supporting}
                    active={
                      // eslint-disable-next-line no-nested-ternary
                      !isConnecting
                        ? 0
                        : connectingSeconds >= SLOW_CONNECTION_HINT_SECONDS
                        ? 2
                        : 1
                    }
                    variants={[
                      t(
                        'Connect your phone via USB and select File Transfer (MTP) mode.'
                      ),
                      t(
                        'Keep the phone unlocked. This can take a few seconds.'
                      ),
                      t(
                        'The phone is not answering yet. If it is locked, unlock it and tap Allow if it asks for access.'
                      ),
                    ]}
                  />
                  <span className={styles.srOnly} aria-live="polite">
                    {isConnecting ? t('Connecting to your phone…') : ''}
                  </span>

                  <div className={styles.actions}>
                    <M3Button
                      size="medium"
                      variant="filled"
                      icon="refresh"
                      disabled={isBusy}
                      onClick={this._handleTryConnection}
                    >
                      {t('Try connection again')}
                    </M3Button>
                    <M3Button
                      size="medium"
                      variant="tonal"
                      icon="help"
                      onClick={this._handleHelpPhoneNotRecognizedBtn}
                    >
                      {t('Guide')}
                    </M3Button>
                  </div>
                </div>

                <div className={styles.stepsColumn}>
                  <div className={styles.stepsTitle}>{t('How to connect')}</div>
                  <ol className={styles.list}>
                    {CONNECTION_STEPS.map((step, index) => (
                      <li key={step.title} className={styles.listItem}>
                        <M3Shape
                          shape={step.shape}
                          size={44}
                          color="currentColor"
                          className={styles[step.avatar]}
                        >
                          <MaterialSymbol
                            name={step.symbol}
                            size={22}
                            fill={1}
                            className={styles.avatarIcon}
                          />
                        </M3Shape>
                        <div className={styles.listText}>
                          <span className={styles.listHeadline}>
                            {t(step.title)}
                          </span>
                          <span className={styles.listSupporting}>
                            {t(step.description)}
                          </span>
                        </div>
                        <span className={styles.listTrailing}>{index + 1}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* full-width status banner under both columns */}
                <div className={styles.statusRow}>
                  {/* exact owner of the phone's USB interface, read from macOS */}
                  {blockers.length > 0 &&
                    errorCard({
                      key: 'blockers',
                      visual: errorShape('block'),
                      title: t('The phone is in use by: {apps}', {
                        apps: blockers
                          .map(({ displayName }) => t(displayName))
                          .join(', '),
                      }),
                      body: blockers.every(({ releasable }) => releasable)
                        ? t(
                            'It is the macOS Photos / Image Capture service: OpenMTP can free the phone for you.'
                          )
                        : t(
                            'Close it so OpenMTP can use the phone. It will be asked to quit normally, like with ⌘Q.'
                          ),
                      actions: blockers.map((blocker) => (
                        <M3Button
                          key={blocker.pid}
                          variant="error"
                          icon={
                            blocker.releasable ? 'lock_open_right' : 'close'
                          }
                          disabled={isBusy}
                          onClick={() => this._handleQuitBlocker(blocker)}
                        >
                          {blocker.releasable
                            ? t('Free the phone and try again')
                            : t('Close {app} and try again', {
                                app: t(blocker.displayName),
                              })}
                        </M3Button>
                      )),
                    })}

                  {quitFailedName &&
                    errorCard({
                      key: 'quit-failed',
                      visual: errorShape('error'),
                      title: t(
                        '{app} did not quit. Close it manually, then try again.',
                        { app: t(quitFailedName) }
                      ),
                    })}

                  {noPhoneOnUsb &&
                    errorCard({
                      key: 'no-phone',
                      visual: (
                        <AngryFaceAnimation
                          size={72}
                          className={styles.statusFace}
                          aria-label={t('The Mac does not see the phone')}
                        />
                      ),
                      title: t('The Mac does not see the phone'),
                      body: t(
                        'Check the cable and choose File Transfer in the USB notification on the phone.'
                      ),
                    })}

                  {connectionDetail &&
                    blockers.length < 1 &&
                    !noPhoneOnUsb &&
                    errorCard({
                      key: 'detail',
                      visual: errorShape(connectionDetail.symbol),
                      title: t(connectionDetail.title),
                      body: (
                        <>
                          {t(connectionDetail.body)}
                          {connectionDetail.steps.length > 0 && (
                            <ol className={styles.statusSteps}>
                              {connectionDetail.steps.map((step) => (
                                <li key={step}>{t(step)}</li>
                              ))}
                            </ol>
                          )}
                          {connectionDetail.technicalDetail && (
                            <span className={styles.technicalDetail}>
                              {t('Technical detail')}:{' '}
                              {connectionDetail.technicalDetail}
                            </span>
                          )}
                        </>
                      ),
                    })}

                  {!isConnecting &&
                    !connectionDetail &&
                    blockers.length < 1 &&
                    phonesOnUsb > 0 && (
                      <div
                        className={classNames(
                          styles.statusCard,
                          styles.statusOk
                        )}
                      >
                        <M3Shape
                          shape="Circle"
                          size={48}
                          color="currentColor"
                          className={styles.statusShape}
                        >
                          <MaterialSymbol
                            name="check"
                            size={26}
                            weight={600}
                            className={styles.statusIcon}
                          />
                        </M3Shape>
                        <div className={styles.statusText}>
                          <div className={styles.statusTitle}>
                            {t('No other app is using the phone')}
                          </div>
                        </div>
                      </div>
                    )}
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
