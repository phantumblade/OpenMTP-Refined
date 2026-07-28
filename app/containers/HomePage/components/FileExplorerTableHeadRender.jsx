import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { styles } from '../styles/FileExplorerTableHeadRender';
import { translate } from '../../../i18n';
import SelectionCheckbox from '../../../components/SelectionCheckbox';

const rows = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'size',
    numeric: false,
    disablePadding: true,
    label: 'Size',
  },
  {
    // for legacy kernel it is date added while for kalam kernel it is modified time
    id: 'dateAdded',
    numeric: false,
    disablePadding: true,
    label: 'Date',
  },
  {
    id: 'extension',
    numeric: false,
    disablePadding: true,
    label: 'Type',
  },
];

class FileExplorerTableHeadRender extends PureComponent {
  createSortHandler = (property) => (event) => {
    const { onRequestSort } = this.props;

    onRequestSort(property, event);
  };

  render() {
    const {
      classes: styles,
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount,
      hideColList,
      multiSelectMode,
      appLanguage,
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          {multiSelectMode && (
            <TableCell padding="none" className={styles.tableHeadCell}>
              <SelectionCheckbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  'aria-label': translate(appLanguage, 'Select All'),
                }}
              />
            </TableCell>
          )}
          {rows.map((row) => {
            return hideColList.indexOf(row.id) < 0 ? (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'inherit'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
                className={styles.tableHeadCell}
              >
                <Tooltip
                  title={translate(appLanguage, 'Sort')}
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {translate(appLanguage, row.label)}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ) : (
              <Fragment key={row.id} />
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

export default withStyles(styles)(FileExplorerTableHeadRender);
