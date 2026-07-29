import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import ReplayIcon from '@material-ui/icons/Replay';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import classNames from 'classnames';
import SlotText from '../../SlotText';
import { styles } from '../styles/FileTransferDialog';
import {
  FILE_TRANSFER_PHASE,
  isTransferPhaseActive,
  transferStepStates,
} from '../../../helpers/fileTransfer';
import { baseName } from '../../../utils/files';
import { niceBytes } from '../../../utils/funcs';
import { translate } from '../../../i18n';

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

  renderStatusIcon = () => {
    const { classes: styles, transfer } = this.props;

    if (transfer.phase === FILE_TRANSFER_PHASE.completed) {
      return <CheckCircleOutlineIcon className={styles.successIcon} />;
    }

    if (transfer.phase === FILE_TRANSFER_PHASE.failed) {
      return <ErrorOutlineIcon className={styles.errorIcon} />;
    }

    return <CircularProgress size={24} color="secondary" />;
  };

  render() {
    const {
      appLanguage,
      classes: styles,
      onClose,
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
      ? `${niceBytes(transfer.totalFileSizeSent || 0)} / ${niceBytes(
          transfer.totalFileSize
        )}`
      : `${filesSentVal} / ${totalFilesVal} ${translate(appLanguage, 'files')}`;

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
        <DialogTitle id="file-transfer-dialog-title">
          <span className={styles.titleRow}>
            <span className={styles.statusIcon}>{this.renderStatusIcon()}</span>
            <span>
              <span className={styles.title}>{this.getTitle()}</span>
              <span className={styles.itemCount}>
                <SlotText text={countVal} />{' '}
                {translate(appLanguage, countVal === '1' ? 'item' : 'items')}
              </span>
            </span>
          </span>
        </DialogTitle>

        <DialogContent>
          <div className={styles.routeCard}>
            <span>{transfer.sourceLabel || '—'}</span>
            <SwapHorizIcon aria-hidden="true" />
            <span>{transfer.destinationLabel || '—'}</span>
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
                  {item.complete ? <CheckCircleOutlineIcon /> : index + 1}
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
                <span title={currentFileName}>{currentFileName || '—'}</span>
                <strong>
                  <SlotText text={percentVal} />
                </strong>
              </div>
              <LinearProgress
                color="secondary"
                variant="determinate"
                value={Math.max(0, Math.min(100, progress))}
                aria-label={translate(appLanguage, 'Transfer progress')}
              />
              <div className={styles.progressMeta}>
                <SlotText text={transferredAmountVal} />
                <span className={styles.speedContainer}>
                  <span className={styles.speedValue}>
                    <SlotText
                      text={transfer.speed ? String(transfer.speed) : '0.00'}
                    />
                  </span>
                  <span className={styles.speedUnit}>MB/s</span>
                </span>
              </div>
            </div>
          )}

          {(transfer.phase === FILE_TRANSFER_PHASE.checking ||
            transfer.phase === FILE_TRANSFER_PHASE.preparing) && (
            <LinearProgress color="secondary" variant="indeterminate" />
          )}

          {transfer.phase === FILE_TRANSFER_PHASE.failed && (
            <div className={styles.errorBox} role="alert">
              {transfer.errorMessage ||
                translate(appLanguage, 'The transfer could not be completed.')}
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

        {!active && (
          <DialogActions className={styles.actions}>
            {transfer.phase === FILE_TRANSFER_PHASE.failed && (
              <Button
                onClick={onRetry}
                color="secondary"
                startIcon={<ReplayIcon />}
              >
                {translate(appLanguage, 'Try again')}
              </Button>
            )}
            <Button onClick={onClose} color="secondary" variant="contained">
              {translate(appLanguage, 'Close')}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  }
}

export default withStyles(styles)(FileTransferDialog);
