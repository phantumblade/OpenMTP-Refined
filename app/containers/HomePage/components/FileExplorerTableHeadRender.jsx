import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { styles } from '../styles/FileExplorerTableHeadRender';
import { translate } from '../../../i18n';
import SelectionCheckbox from '../../../components/SelectionCheckbox';

const rows = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  // for legacy kernel it is date added while for kalam kernel it is modified time
  { id: 'dateAdded', label: 'Date' },
  { id: 'extension', label: 'Type' },
];

// Sorting as a Material 3 Expressive connected button group: the active
// button shows the direction arrow (click again to reverse it); switching
// field moves the arrow, with width, shape and rotation all animated.
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
    const t = (key, values) => translate(appLanguage, key, values);
    const visibleRows = rows.filter((row) => hideColList.indexOf(row.id) < 0);

    return (
      <TableHead>
        <TableRow>
          <TableCell
            colSpan={visibleRows.length + (multiSelectMode ? 1 : 0)}
            padding="none"
            className={styles.tableHeadCell}
          >
            <div className={styles.bar}>
              {multiSelectMode && (
                <SelectionCheckbox
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{ 'aria-label': t('Select All') }}
                />
              )}
              <span className={styles.caption}>{t('Sort by')}</span>
              <div
                className={styles.group}
                role="group"
                aria-label={t('Sort by')}
              >
                {visibleRows.map((row) => {
                  const active = orderBy === row.id;
                  const descending = active && order === 'desc';

                  return (
                    <button
                      key={row.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={
                        active
                          ? t('{field}, {direction}. Click to reverse', {
                              field: t(row.label),
                              direction: descending
                                ? t('descending')
                                : t('ascending'),
                            })
                          : t('Sort by {field}', { field: t(row.label) })
                      }
                      className={classNames(styles.button, {
                        [styles.buttonActive]: active,
                      })}
                      onClick={this.createSortHandler(row.id)}
                    >
                      <span>{t(row.label)}</span>
                      <span
                        className={classNames(styles.arrow, {
                          [styles.arrowShown]: active,
                          [styles.arrowDown]: descending,
                        })}
                        aria-hidden="true"
                      >
                        <MaterialSymbol
                          name="arrow_upward"
                          size={18}
                          weight={500}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }
}

export default withStyles(styles)(FileExplorerTableHeadRender);
