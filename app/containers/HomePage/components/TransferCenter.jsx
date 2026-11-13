import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import M3Button from '../../../components/m3/M3Button';
import M3LoadingIndicator from '../../../components/m3/M3LoadingIndicator';
import M3WavyProgress from '../../../components/m3/M3WavyProgress';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { formatDuration } from '../../../components/DialogBox/components/FileTransferDialog';
import { styles } from '../styles/TransferCenter';
import {
  listDirectory,
  setFileTransferClipboard,
  setFileTransferProgress,
  setTransferCenter,
} from '../actions';
import {
  makeFileTransferClipboard,
  makeFileTransferProgess,
  makeMtpDevice,
  makeTransferCenter,
} from '../selectors';
import {
  makeAppLanguage,
  makeHideHiddenFiles,
  makePhotoBackupFolder,
} from '../../Settings/selectors';
import { startPhotoBackup } from '../photoBackup';
import {
  FILE_TRANSFER_PHASE,
  isTransferPhaseActive,
} from '../../../helpers/fileTransfer';
import {
  clearTransferHistory,
  getTransferHistory,
  subscribeToTransferHistory,
} from '../../../helpers/transferHistory';
import { DEVICES_LABEL } from '../../../constants';
import { niceBytes } from '../../../utils/funcs';
import { translate } from '../../../i18n';

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "18:42" for today, "12 nov, 18:42" for older transfers
export const formatEndedAt = (endedAt, language, now = new Date()) => {
  const date = new Date(endedAt);
  const time = { hour: '2-digit', minute: '2-digit' };

  return new Intl.DateTimeFormat(
    language,
    sameDay(date, now) ? time : { day: 'numeric', month: 'short', ...time }
  ).format(date);
};

// Transfers: the floating pill of a copy that continues in the background
// and the side sheet with the running copy, the items ready to be pasted and
// the history of the copies that ended.
class TransferCenter extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { history: getTransferHistory() };
  }

  componentDidMount() {
    this.unsubscribe = subscribeToTransferHistory((history) => {
      this.setState({ history });
    });
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  t = (key, values) => {
    const { appLanguage } = this.props;

    return translate(appLanguage, key, values);
  };

  close = () => {
    const { actionSetTransferCenter } = this.props;

    actionSetTransferCenter({ open: false });
  };

  // back to the transfer dialog
  expand = () => {
    const { actionSetFileTransferProgress } = this.props;

    this.close();
    actionSetFileTransferProgress({ minimized: false });
  };

  openFolder = ({ destinationDeviceType, destinationFolder }) => {
    const { actionListDirectory, hideHiddenFiles } = this.props;

    this.close();
    actionListDirectory(
      {
        filePath: destinationFolder,
        ignoreHidden: hideHiddenFiles[destinationDeviceType],
      },
      destinationDeviceType
    );
  };

  routeLabel = ({ sourceDeviceType, destinationDeviceType }) =>
    [sourceDeviceType, destinationDeviceType]
      .map((type) => (DEVICES_LABEL[type] ? this.t(DEVICES_LABEL[type]) : '—'))
      .join(' → ');

  countLabel = (count) => `${count} ${this.t(count === 1 ? 'item' : 'items')}`;

  percent = () => {
    const { transfer } = this.props;
    const progress = Number.isFinite(transfer.totalFileProgress)
      ? transfer.totalFileProgress
      : transfer.activeFileProgress || 0;

    return Math.max(0, Math.min(100, Math.floor(progress)));
  };

  phaseLabel = () => {
    const { transfer } = this.props;

    return this.t(
      {
        [FILE_TRANSFER_PHASE.checking]: 'Checking destination',
        [FILE_TRANSFER_PHASE.waitingForConfirmation]: 'Checking destination',
        [FILE_TRANSFER_PHASE.preparing]: 'Preparing transfer',
        [FILE_TRANSFER_PHASE.transferring]: 'Transfer in progress',
        [FILE_TRANSFER_PHASE.completed]: 'Transfer completed',
        [FILE_TRANSFER_PHASE.failed]: 'Transfer failed',
      }[transfer.phase] || 'File transfer'
    );
  };

  renderPill() {
    const { classes, transfer } = this.props;

    if (!transfer.toggle || !transfer.minimized) {
      return null;
    }

    const active = isTransferPhaseActive(transfer.phase);
    const failed = transfer.phase === FILE_TRANSFER_PHASE.failed;
    const transferring = transfer.phase === FILE_TRANSFER_PHASE.transferring;

    return (
      <button
        type="button"
        className={classNames(classes.pill, {
          [classes.pillDone]: !active && !failed,
          [classes.pillFailed]: failed,
        })}
        onClick={this.expand}
        aria-label={`${this.phaseLabel()}. ${this.t('Show details')}`}
      >
        {active ? (
          <M3LoadingIndicator
            size={28}
            color="currentColor"
            aria-label={this.phaseLabel()}
          />
        ) : (
          <MaterialSymbol
            name={failed ? 'error' : 'check_circle'}
            size={24}
            fill={1}
          />
        )}
        <span className={classes.pillText}>{this.phaseLabel()}</span>
        {transferring && (
          <span className={classes.pillPercent}>{this.percent()}%</span>
        )}
        <MaterialSymbol name="open_in_full" size={18} />
      </button>
    );
  }

  renderBackup() {
    const {
      classes,
      transfer,
      phoneConnected,
      photoBackupFolder,
      actionStartPhotoBackup,
    } = this.props;
    const busy = isTransferPhaseActive(transfer.phase);

    return (
      <section className={classes.backup}>
        <div className={classes.backupHeader}>
          <MaterialSymbol name="add_photo_alternate" size={24} />
          <div className={classes.clipboardText}>
            <span className={classes.backupTitle}>
              {this.t('Photo backup')}
            </span>
            <span className={classes.backupText}>
              {this.t(
                'Copies to the Mac the phone’s new photos and videos, skipping the ones already copied.'
              )}
            </span>
          </div>
        </div>
        {photoBackupFolder && (
          <span className={classes.backupFolder}>{photoBackupFolder}</span>
        )}
        <div className={classes.backupActions}>
          {photoBackupFolder && (
            <M3Button
              variant="text"
              size="small"
              disabled={busy}
              onClick={() => {
                this.close();
                actionStartPhotoBackup({ chooseFolder: true });
              }}
            >
              {this.t('Change folder')}
            </M3Button>
          )}
          <M3Button
            variant="filled"
            size="small"
            icon="backup"
            disabled={busy || !phoneConnected}
            onClick={() => {
              this.close();
              actionStartPhotoBackup();
            }}
          >
            {this.t(phoneConnected ? 'Back up now' : 'Connect the phone')}
          </M3Button>
        </div>
      </section>
    );
  }

  renderRunning() {
    const { classes, transfer } = this.props;

    if (!transfer.toggle || !transfer.sessionId) {
      return null;
    }

    const active = isTransferPhaseActive(transfer.phase);
    const transferring = transfer.phase === FILE_TRANSFER_PHASE.transferring;

    if (!active) {
      return null;
    }

    return (
      <section className={classes.section}>
        <h3 className={classes.sectionTitle}>{this.t('In progress')}</h3>
        <div className={classes.running}>
          <div className={classes.runningHeader}>
            <span className={classes.entryTitle}>
              {this.routeLabel(transfer)}
            </span>
            {transferring && (
              <span className={classes.runningPercent}>{this.percent()}%</span>
            )}
          </div>
          <M3WavyProgress
            indeterminate={!transferring}
            value={this.percent()}
            aria-label={this.t('Transfer progress')}
          />
          <div className={classes.runningFooter}>
            <span>
              {this.phaseLabel()} · {this.countLabel(transfer.itemCount || 0)}
            </span>
            <M3Button variant="tonal" size="small" onClick={this.expand}>
              {this.t('Show details')}
            </M3Button>
          </div>
        </div>
      </section>
    );
  }

  renderClipboard() {
    const { classes, clipboard, actionSetFileTransferClipboard } = this.props;
    const count = clipboard?.queue?.length || 0;

    if (count < 1) {
      return null;
    }

    return (
      <section className={classes.section}>
        <h3 className={classes.sectionTitle}>{this.t('Ready to paste')}</h3>
        <div className={classes.clipboard}>
          <MaterialSymbol name="content_paste" size={22} />
          <div className={classes.clipboardText}>
            <span className={classes.entryTitle}>{this.countLabel(count)}</span>
            <span className={classes.entryMeta}>
              {this.t(
                'Copied from {device}. Paste them with ⌘V in the other pane.',
                {
                  device: this.t(DEVICES_LABEL[clipboard.source] || 'Computer'),
                }
              )}
            </span>
          </div>
          <M3Button
            variant="text"
            size="small"
            onClick={() =>
              actionSetFileTransferClipboard({
                queue: [],
                source: null,
                sessionId: null,
                preparedAt: null,
              })
            }
          >
            {this.t('Clear')}
          </M3Button>
        </div>
      </section>
    );
  }

  renderHistory() {
    const { classes, appLanguage } = this.props;
    const { history } = this.state;

    if (history.length < 1) {
      return (
        <section className={classes.section}>
          <h3 className={classes.sectionTitle}>{this.t('History')}</h3>
          <p className={classes.empty}>
            {this.t(
              'The copies you make will be listed here. To copy, select files, press ⌘C, then ⌘V in the other pane.'
            )}
          </p>
        </section>
      );
    }

    return (
      <section className={classes.section}>
        <div className={classes.sectionHeader}>
          <h3 className={classes.sectionTitle}>{this.t('History')}</h3>
          <M3Button variant="text" size="small" onClick={clearTransferHistory}>
            {this.t('Clear history')}
          </M3Button>
        </div>
        <ul className={classes.list}>
          {history.map((entry) => {
            const failed = entry.status === 'failed';
            const toPhone = entry.destinationDeviceType === 'mtp';
            const details = [
              this.countLabel(entry.itemCount),
              entry.totalFileSize > 0 ? niceBytes(entry.totalFileSize) : null,
              entry.elapsedMs >= 1000 ? formatDuration(entry.elapsedMs) : null,
            ].filter(Boolean);

            return (
              <li key={entry.id} className={classes.entry}>
                <span
                  className={classNames(classes.entryIcon, {
                    [classes.entryIconFailed]: failed,
                  })}
                >
                  <MaterialSymbol
                    // eslint-disable-next-line no-nested-ternary
                    name={failed ? 'error' : toPhone ? 'upload' : 'download'}
                    size={22}
                    fill={failed ? 1 : 0}
                  />
                </span>
                <div className={classes.entryText}>
                  <span className={classes.entryTitle}>
                    {this.routeLabel(entry)}
                  </span>
                  <span className={classes.entryMeta}>
                    {failed
                      ? entry.errorMessage || this.t('Transfer failed')
                      : details.join(' · ')}
                  </span>
                  {entry.destinationFolder && (
                    <span className={classes.entryPath}>
                      {entry.destinationFolder}
                    </span>
                  )}
                </div>
                <div className={classes.entryEnd}>
                  <span className={classes.entryTime}>
                    {formatEndedAt(entry.endedAt, appLanguage)}
                  </span>
                  {entry.destinationFolder && entry.destinationDeviceType && (
                    <button
                      type="button"
                      className={classes.entryAction}
                      aria-label={this.t('Open the destination folder')}
                      title={this.t('Open the destination folder')}
                      onClick={() => this.openFolder(entry)}
                    >
                      <MaterialSymbol name="folder_open" size={20} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  render() {
    const { classes, transferCenter } = this.props;

    return (
      <>
        {this.renderPill()}
        <Drawer
          anchor="right"
          open={Boolean(transferCenter?.open)}
          onClose={this.close}
          classes={{ paper: classes.sheet }}
        >
          <header className={classes.header}>
            <h2 className={classes.title}>{this.t('Transfers')}</h2>
            <button
              type="button"
              className={classes.entryAction}
              aria-label={this.t('Close')}
              onClick={this.close}
            >
              <MaterialSymbol name="close" size={22} />
            </button>
          </header>
          <div className={classes.body}>
            {this.renderBackup()}
            {this.renderRunning()}
            {this.renderClipboard()}
            {this.renderHistory()}
          </div>
        </Drawer>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  transfer: makeFileTransferProgess(state),
  clipboard: makeFileTransferClipboard(state),
  transferCenter: makeTransferCenter(state),
  appLanguage: makeAppLanguage(state),
  hideHiddenFiles: makeHideHiddenFiles(state),
  photoBackupFolder: makePhotoBackupFolder(state),
  phoneConnected: Boolean(makeMtpDevice(state)?.isAvailable),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      actionSetTransferCenter: setTransferCenter,
      actionSetFileTransferProgress: setFileTransferProgress,
      actionSetFileTransferClipboard: setFileTransferClipboard,
      actionStartPhotoBackup: startPhotoBackup,
      actionListDirectory:
        ({ ...args }, deviceType) =>
        (_, getState) => {
          dispatch(listDirectory({ ...args }, deviceType, getState));
        },
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TransferCenter));
