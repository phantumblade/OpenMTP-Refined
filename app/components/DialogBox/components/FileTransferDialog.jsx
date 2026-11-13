import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import classNames from 'classnames';
import M3Button from '../../m3/M3Button';
import M3LoadingIndicator from '../../m3/M3LoadingIndicator';
import M3Shape from '../../m3/M3Shape';
import M3WavyProgress from '../../m3/M3WavyProgress';
import MaterialSymbol from '../../m3/MaterialSymbol';
import SlotText from '../../SlotText';
import { styles } from '../styles/FileTransferDialog';
import {
  FILE_TRANSFER_PHASE,
  isTransferPhaseActive,
  transferStepStates,
} from '../../../helpers/fileTransfer';
import { baseName } from '../../../utils/files';
import { formatStorageSize } from '../../../helpers/diskSpace';
import { translate } from '../../../i18n';

// 54 s, 3 min 05 s, 1 h 12 min
export const formatDuration = (ms) => {
  const seconds = Math.round(ms / 1000);

  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ${String(seconds % 60).padStart(2, '0')} s`;
  }

  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(
    2,
    '0'
  )} min`;
};

class FileTransferDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { now: Date.now() };
  }

  componentDidMount() {
    this.syncActivityTimer();
  }

  componentDidUpdate(previousProps) {
    const { trigger: previousTrigger, transfer: previousTransfer } =
      previousProps;
    const { trigger, transfer } = this.props;

    if (
      previousTrigger !== trigger ||
      previousTransfer.phase !== transfer.phase
    ) {
      this.syncActivityTimer();
    }
  }

  componentWillUnmount() {
    this.stopActivityTimer();
  }

  syncActivityTimer = () => {
    const { transfer, trigger } = this.props;

    this.stopActivityTimer();

    if (trigger && isTransferPhaseActive(transfer.phase)) {
      this.activityTimer = setInterval(() => {
        this.setState({ now: Date.now() });
      }, 1000);
    }
  };

  stopActivityTimer = () => {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  };

  getTitle = () => {
    const { appLanguage, transfer } = this.props;
    const titleByPhase = {
      [FILE_TRANSFER_PHASE.checking]: 'Checking destination',
      [FILE_TRANSFER_PHASE.preparing]: 'Preparing transfer',
      [FILE_TRANSFER_PHASE.transferring]: 'Transfer in progress',
      [FILE_TRANSFER_PHASE.completed]: 'Transfer completed',
      [FILE_TRANSFER_PHASE.failed]: 'Transfer failed',
    };

    return translate(
      appLanguage,
      titleByPhase[transfer.phase] || 'File transfer'
    );
  };

  getActivityText = () => {
    const { appLanguage, transfer } = this.props;
    const { now } = this.state;
    const lastActivityAt = transfer.lastActivityAt || transfer.startedAt;

    if (!lastActivityAt || !isTransferPhaseActive(transfer.phase)) {
      return null;
    }

    const silentSeconds = Math.max(
      0,
      Math.floor((now - lastActivityAt) / 1000)
    );

    if (silentSeconds < 5) {
      return translate(appLanguage, 'Operation active');
    }

    return translate(appLanguage, 'Waiting for device response for {count}s', {
      count: silentSeconds,
    });
  };

  renderStatusVisual = () => {
    const { classes: styles, transfer, appLanguage } = this.props;

    if (transfer.phase === FILE_TRANSFER_PHASE.completed) {
      return (
        <M3Shape
          shape="Cookie9Sided"
          size={56}
          color="currentColor"
          className={styles.visualSuccess}
        >
          <MaterialSymbol
            name="check"
            size={28}
            weight={700}
            className={styles.visualIcon}
          />
        </M3Shape>
      );
    }

    if (transfer.phase === FILE_TRANSFER_PHASE.failed) {
      return (
        <M3Shape
          shape="Cookie4Sided"
          size={56}
          color="currentColor"
          className={styles.visualError}
        >
          <MaterialSymbol
            name="error"
            size={28}
            fill={1}
            className={styles.visualIcon}
          />
        </M3Shape>
      );
    }

    return (
      <M3LoadingIndicator
        size={56}
        contained
        color="var(--md-sys-color-on-primary-container)"
        containerColor="var(--md-sys-color-primary-container)"
        aria-label={translate(appLanguage, 'Transfer in progress')}
      />
    );
  };

  render() {
    const {
      appLanguage,
      classes: styles,
      onClose,
      onMinimize,
      onRetry,
      transfer,
      trigger,
    } = this.props;
    const active = isTransferPhaseActive(transfer.phase);
    const steps = transferStepStates(transfer.phase);
    const progress = Number.isFinite(transfer.totalFileProgress)
      ? transfer.totalFileProgress
      : transfer.activeFileProgress || 0;
    const currentFileName = transfer.currentFile
      ? baseName(transfer.currentFile)
      : null;
    const activityText = this.getActivityText();
    const countVal = String(transfer.itemCount || transfer.totalFiles || 0);
    const percentVal = `${Math.floor(progress)}%`;
    const filesSentVal = String(transfer.filesSent || 0);
    const totalFilesVal = String(
      transfer.totalFiles || transfer.itemCount || 0
    );
    const transferredAmountVal = transfer.totalFileSize
      ? `${formatStorageSize(
          transfer.totalFileSizeSent || 0,
          appLanguage
        )} / ${formatStorageSize(transfer.totalFileSize, appLanguage)}`
      : `${filesSentVal} / ${totalFilesVal} ${translate(appLanguage, 'files')}`;

    // what was copied, shown when the transfer ends
    const endedAt = transfer.completedAt || transfer.lastActivityAt;
    const elapsedMs =
      transfer.startedAt && endedAt
        ? Math.max(0, endedAt - transfer.startedAt)
        : 0;
    const summary = [
      {
        label: translate(appLanguage, countVal === '1' ? 'item' : 'items'),
        value: countVal,
      },
      transfer.totalFileSize > 0 && {
        label: translate(appLanguage, 'copied'),
        value: formatStorageSize(transfer.totalFileSize, appLanguage),
      },
      elapsedMs >= 1000 && {
        label: translate(appLanguage, 'time taken'),
        value: formatDuration(elapsedMs),
      },
      elapsedMs >= 1000 &&
        transfer.totalFileSize > 0 && {
          label: translate(appLanguage, 'average speed'),
          value: `${formatStorageSize(
            (transfer.totalFileSize / elapsedMs) * 1000,
            appLanguage
          )}/s`,
        },
    ].filter(Boolean);

    return (
      <Dialog
        disableBackdropClick={active}
        disableEscapeKeyDown={active}
        className={styles.root}
        open={trigger}
        fullWidth
        maxWidth="sm"
        aria-labelledby="file-transfer-dialog-title"
        aria-describedby="file-transfer-dialog-status"
      >
        <div className={styles.header}>
          <div className={styles.visual}>{this.renderStatusVisual()}</div>
          <div>
            <h2 id="file-transfer-dialog-title" className={styles.title}>
              {this.getTitle()}
            </h2>
            <div className={styles.itemCount}>
              <SlotText text={countVal} />{' '}
              {translate(appLanguage, countVal === '1' ? 'item' : 'items')}
            </div>
          </div>
        </div>

        <DialogContent>
          <div className={styles.route}>
            <span className={styles.routeChip}>
              {transfer.sourceLabel || '—'}
            </span>
            <MaterialSymbol
              name="arrow_forward"
              size={20}
              weight={600}
              className={styles.routeArrow}
            />
            <span className={styles.routeChip}>
              {transfer.destinationLabel || '—'}
            </span>
          </div>

          <ol
            className={styles.steps}
            aria-label={translate(appLanguage, 'Transfer steps')}
          >
            {steps.map((item, index) => (
              <li
                key={item.step}
                className={classNames(styles.step, {
                  [styles.stepActive]: item.active,
                  [styles.stepComplete]: item.complete,
                })}
              >
                <span className={styles.stepMarker}>
                  {item.complete ? (
                    <MaterialSymbol name="check" size={16} weight={700} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  {translate(
                    appLanguage,
                    {
                      [FILE_TRANSFER_PHASE.checking]: 'Check destination',
                      [FILE_TRANSFER_PHASE.preparing]: 'Prepare files',
                      [FILE_TRANSFER_PHASE.transferring]: 'Transfer files',
                    }[item.step]
                  )}
                </span>
              </li>
            ))}
          </ol>

          {transfer.phase === FILE_TRANSFER_PHASE.transferring && (
            <div className={styles.progressBlock}>
              <div className={styles.progressHeader}>
                <span className={styles.fileName}>
                  {currentFileName || '—'}
                </span>
                <span className={styles.percent}>
                  <SlotText text={percentVal} />
                </span>
              </div>
              <M3WavyProgress
                value={Math.max(0, Math.min(100, progress))}
                aria-label={translate(appLanguage, 'Transfer progress')}
              />
              <div className={styles.progressMeta}>
                <SlotText text={transferredAmountVal} />
                <span className={styles.speed}>
                  <SlotText
                    text={transfer.speed ? String(transfer.speed) : '0.00'}
                  />
                  <span>MB/s</span>
                </span>
              </div>
            </div>
          )}

          {(transfer.phase === FILE_TRANSFER_PHASE.checking ||
            transfer.phase === FILE_TRANSFER_PHASE.preparing) && (
            <M3WavyProgress
              indeterminate
              aria-label={translate(appLanguage, 'Transfer progress')}
            />
          )}

          {transfer.phase === FILE_TRANSFER_PHASE.completed && (
            <dl className={styles.summary}>
              {summary.map(({ label, value }) => (
                <div key={label} className={styles.summaryCell}>
                  <dd className={styles.summaryValue}>{value}</dd>
                  <dt className={styles.summaryLabel}>{label}</dt>
                </div>
              ))}
            </dl>
          )}

          {transfer.phase === FILE_TRANSFER_PHASE.completed &&
            transfer.note && (
              <div className={styles.noteBox}>
                <MaterialSymbol name="info" size={22} />
                <span>{transfer.note}</span>
              </div>
            )}

          {transfer.phase === FILE_TRANSFER_PHASE.failed && (
            <div className={styles.errorBox} role="alert">
              <MaterialSymbol name="error" size={22} fill={1} />
              <span>
                {transfer.errorMessage ||
                  translate(
                    appLanguage,
                    'The transfer could not be completed.'
                  )}
              </span>
            </div>
          )}

          <div
            id="file-transfer-dialog-status"
            className={styles.activityRow}
            aria-live="polite"
          >
            <span>{activityText}</span>
            <span className={styles.diagnosticId}>
              {translate(appLanguage, 'Diagnostic ID')}:{' '}
              {transfer.sessionId || '—'}
            </span>
          </div>
        </DialogContent>

        {active && onMinimize && (
          <div className={styles.actions}>
            <M3Button
              variant="text"
              icon="close_fullscreen"
              onClick={onMinimize}
            >
              {translate(appLanguage, 'Continue in the background')}
            </M3Button>
          </div>
        )}

        {!active && (
          <div className={styles.actions}>
            {transfer.phase === FILE_TRANSFER_PHASE.failed && (
              <M3Button variant="tonal" icon="replay" onClick={onRetry}>
                {translate(appLanguage, 'Try again')}
              </M3Button>
            )}
            <M3Button variant="filled" onClick={onClose}>
              {translate(appLanguage, 'Close')}
            </M3Button>
          </div>
        )}
      </Dialog>
    );
  }
}

export default withStyles(styles)(FileTransferDialog);
