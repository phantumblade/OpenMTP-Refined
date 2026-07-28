import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { niceBytes, springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyListRender';
import { imgsrc } from '../../../utils/imgsrc';
import { appDateFormat } from '../../../utils/date';
import { getFileIcon, getFolderIcon } from '../../../helpers/fileExplorerIcons';
import SelectionCheckbox from '../../../components/SelectionCheckbox';

class FileExplorerTableBodyListRender extends PureComponent {
  RenderFileIcon = () => {
    const { classes: styles, item, appThemeMode } = this.props;

    const themedFileIcon = getFileIcon(item, appThemeMode);

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(themedFileIcon)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
        />
      </div>
    );
  };

  RenderFolderIcon = () => {
    const {
      classes: styles,
      item,
      deviceType,
      currentBrowsePath,
      appThemeMode,
    } = this.props;

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(
            getFolderIcon({
              item,
              deviceType,
              currentBrowsePath,
              appThemeMode,
            })
          )}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
        />
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      isSelected,
      item,
      deviceType,
      _eventTarget,
      getTableData,
      hideColList,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
      multiSelectMode,
    } = this.props;

    const { RenderFileIcon, RenderFolderIcon } = this;
    const isMultiSelectMode = multiSelectMode[deviceType];

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS
    );

    return (
      <TableRow
        data-file-explorer-row="true"
        draggable
        hover
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        selected={isSelected}
        className={classNames({
          [styles.tableRowSelected]: isSelected,
        })}
        onDragStart={(event) => {
          if (!isSelected) {
            onTableClick(item.path, deviceType, event, 'replace');
          }
        }}
      >
        {isMultiSelectMode && (
          <TableCell
            padding="none"
            className={`${styles.tableCell} checkboxCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...getTableData() },
                _eventTarget
              )
            }
          >
            <SelectionCheckbox
              checked={isSelected}
              inputProps={{ 'aria-label': `Select ${item.name}` }}
              onClick={(event) =>
                onTableClick(item.path, deviceType, event, 'toggle')
              }
            />
          </TableCell>
        )}
        {hideColList.indexOf('name') < 0 && (
          <TableCell
            padding="default"
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, 'row')
            }
            className={`${styles.tableCell} nameCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...getTableData() },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {item.isFolder ? <RenderFolderIcon /> : <RenderFileIcon />}
            &nbsp;&nbsp;
            {fileName.isTruncated ? (
              <Tooltip title={fileName.text}>
                <div className={styles.truncate}>{fileName.truncatedText}</div>
              </Tooltip>
            ) : (
              fileName.text
            )}
          </TableCell>
        )}
        {hideColList.indexOf('size') < 0 && (
          <TableCell
            padding="none"
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, 'row')
            }
            className={`${styles.tableCell} sizeCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...getTableData() },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {item.isFolder ? `--` : `${niceBytes(item.size)}`}
          </TableCell>
        )}
        {hideColList.indexOf('dateAdded') < 0 && (
          <TableCell
            padding="none"
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, 'row')
            }
            className={`${styles.tableCell} dateAddedCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...getTableData() },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {appDateFormat(item.dateAdded)}
          </TableCell>
        )}
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyListRender);
