import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ComputerIcon from '@material-ui/icons/Computer';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import Button from '@material-ui/core/Button';
import SlotText from '../../../components/SlotText';
import { styles } from '../styles/FileExplorerTableFooterStatusBarRender';
import { DEVICE_TYPE } from '../../../enums';
import { DEVICES_LABEL } from '../../../constants';
import { getDeviceBrand, translate } from '../../../i18n';
import { isTransferPhaseActive } from '../../../helpers/fileTransfer';

class FileExplorerTableFooterStatusBarRender extends PureComponent {
  directoryStatsCache = {
    nodes: null,
    stats: { total: 0, directories: 0, files: 0 },
  };

  getDirectoryListStats = () => {
    const { directoryLists } = this.props;
    const nodes = directoryLists.nodes || [];

    if (this.directoryStatsCache.nodes === nodes) {
      return this.directoryStatsCache.stats;
    }

    let directories = 0;
    let files = 0;

    nodes.forEach((item) => {
      if (item.isFolder) {
        directories += 1;
      } else {
        files += 1;
      }
    });

    const total = directories + files;
    const stats = { total, directories, files };

    this.directoryStatsCache = { nodes, stats };

    return stats;
  };

  RenderDeviceName = () => {
    const { classes: styles, deviceType, mtpDevice, appLanguage } = this.props;

    if (deviceType === DEVICE_TYPE.local) {
      return (
        <div className={styles.deviceBlock}>
          <ComputerIcon />
          <span>{translate(appLanguage, DEVICES_LABEL[deviceType])}</span>
        </div>
      );
    }

    return (
      <div className={styles.deviceBlock}>
        <PhoneAndroidIcon />
        <span>
          {mtpDevice?.isAvailable && mtpDevice?.info?.mtpDeviceInfo
            ? `${getDeviceBrand(mtpDevice.info.mtpDeviceInfo.Manufacturer)} ${
                mtpDevice.info.mtpDeviceInfo.Model
              }`.trim()
            : translate(appLanguage, DEVICES_LABEL[deviceType])}
        </span>
      </div>
    );
  };

  render() {
    const {
      appLanguage,
      classes: styles,
      deviceType,
      fileTransferClipboard,
      fileTransferProgress,
      onPaste,
    } = this.props;

    const { directories, files, total } = this.getDirectoryListStats();
    const fileTransferClipboardLength = fileTransferClipboard.queue.length;
    const isTransferDestination =
      fileTransferClipboard.source &&
      fileTransferClipboard.source !== deviceType;
    const transferActive = isTransferPhaseActive(fileTransferProgress?.phase);
    const { RenderDeviceName } = this;

    return (
      <div className={styles.root}>
        <RenderDeviceName />
        <div className={styles.metricsBlock}>
          <span className={styles.totalMetric}>
            <span className={styles.slotWrapper}>
              <SlotText text={String(total)} />
            </span>{' '}
            {translate(appLanguage, total === 1 ? 'item' : 'items')}
          </span>
          <span className={styles.metric}>
            <FolderOutlinedIcon />
            <span className={styles.slotWrapper}>
              <SlotText text={String(directories)} />
            </span>{' '}
            {translate(appLanguage, directories === 1 ? 'folder' : 'folders')}
          </span>
          <span className={styles.metric}>
            <InsertDriveFileOutlinedIcon />
            <span className={styles.slotWrapper}>
              <SlotText text={String(files)} />
            </span>{' '}
            {translate(appLanguage, files === 1 ? 'file' : 'files')}
          </span>
        </div>
        <div className={styles.contextBlock}>
          {fileTransferClipboardLength > 0 && (
            <>
              {isTransferDestination ? (
                <Button
                  className={styles.transferButton}
                  color="secondary"
                  size="small"
                  variant="contained"
                  disabled={transferActive}
                  startIcon={<SwapHorizIcon />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPaste();
                  }}
                >
                  {transferActive
                    ? translate(appLanguage, 'Transfer in progress')
                    : translate(appLanguage, 'Transfer here')}
                  <span className={styles.transferCount}>
                    <span className={styles.slotWrapper}>
                      <SlotText text={String(fileTransferClipboardLength)} />
                    </span>
                  </span>
                </Button>
              ) : (
                <span className={styles.clipboardMetric}>
                  <AssignmentOutlinedIcon />
                  <span className={styles.slotWrapper}>
                    <SlotText text={String(fileTransferClipboardLength)} />
                  </span>{' '}
                  {translate(
                    appLanguage,
                    fileTransferClipboardLength === 1
                      ? 'item ready'
                      : 'items ready'
                  )}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableFooterStatusBarRender);
