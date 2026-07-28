import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableFooter from '@material-ui/core/TableFooter';
import { styles } from '../styles/FileExplorerTableFooterRender';
import Breadcrumb from '../../../components/Breadcrumb';
import FileExplorerTableFooterStatusBarRender from './FileExplorerTableFooterStatusBarRender';

class FileExplorerTableFooterRender extends PureComponent {
  render() {
    const {
      classes: styles,
      currentBrowsePath,
      deviceType,
      onBreadcrumbPathClick,
      isStatusBarEnabled,
      directoryLists,
      fileTransferClipboard,
      fileTransferProgress,
      mtpDevice,
      appLanguage,
      onPaste,
    } = this.props;

    return (
      <TableFooter component="div" className={styles.tableFooter}>
        {(isStatusBarEnabled || fileTransferClipboard.queue.length > 0) && (
          <FileExplorerTableFooterStatusBarRender
            directoryLists={directoryLists}
            fileTransferClipboard={fileTransferClipboard}
            fileTransferProgress={fileTransferProgress}
            deviceType={deviceType}
            mtpDevice={mtpDevice}
            appLanguage={appLanguage}
            onPaste={onPaste}
          />
        )}
        <Breadcrumb
          onBreadcrumbPathClick={onBreadcrumbPathClick}
          currentBrowsePath={currentBrowsePath[deviceType]}
          deviceType={deviceType}
        />
      </TableFooter>
    );
  }
}

export default withStyles(styles)(FileExplorerTableFooterRender);
