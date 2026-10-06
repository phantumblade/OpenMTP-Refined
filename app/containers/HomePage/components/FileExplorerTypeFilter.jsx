import React, { PureComponent } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import M3Button from '../../../components/m3/M3Button';
import M3Shape from '../../../components/m3/M3Shape';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { FilterList as FilterListIcon } from '../../../components/m3/symbolIcons';
import { styles } from '../styles/FileExplorerSearchBar';
import { translate } from '../../../i18n';
import {
  NO_FILE_EXTENSION,
  isFileTypeFilterActive,
} from '../../../helpers/fileTypeFilter';

class FileExplorerTypeFilter extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      draft: [...props.value],
    };
  }

  componentDidUpdate(_, prevState) {
    const { value } = this.props;
    const { anchorEl } = this.state;

    if (prevState.anchorEl && !anchorEl) {
      this.setState({ draft: [...value] }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  open = (event) => {
    const { value } = this.props;

    this.setState({ anchorEl: event.currentTarget, draft: [...value] });
  };

  close = () => this.setState({ anchorEl: null });

  toggle = (extension) => () => {
    this.setState((state) => ({
      draft: state.draft.includes(extension)
        ? state.draft.filter((item) => item !== extension)
        : [...state.draft, extension],
    }));
  };

  apply = () => {
    const { onChange } = this.props;
    const { draft } = this.state;

    onChange([...draft]);
    this.close();
  };

  clear = () => {
    const { onChange } = this.props;

    onChange([]);
    this.setState({ draft: [], anchorEl: null });
  };

  render() {
    const { classes, value, options, disabled, appLanguage } = this.props;
    const { anchorEl, draft } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const active = isFileTypeFilterActive(value);
    const label = active
      ? t('{count} file types selected', { count: value.length })
      : t('Filter by file type');

    return (
      <>
        <Tooltip title={label}>
          <IconButton
            size="small"
            disableRipple
            disabled={disabled}
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={Boolean(anchorEl)}
            className={`${classes.filterButton} ${
              active ? classes.filterButtonActive : ''
            }`}
            onClick={this.open}
          >
            <FilterListIcon />
            {active && (
              <span className={classes.filterCountBadge}>{value.length}</span>
            )}
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          classes={{ paper: classes.typeFilterPaper }}
        >
          <div
            className={classes.dateFilterContent}
            role="dialog"
            aria-label={t('Filter files by type')}
          >
            <div className={classes.dateFilterHeader}>
              <M3Shape
                shape="Cookie9Sided"
                size={44}
                color="currentColor"
                className={classes.headerShape}
              >
                <MaterialSymbol
                  name="filter_list"
                  size={22}
                  className={classes.headerIcon}
                />
              </M3Shape>
              <div>
                <h3>{t('Filter files by type')}</h3>
                <p>{t('Sorting will remain unchanged')}</p>
              </div>
            </div>

            <div className={classes.typeFilterList} role="group">
              {options.length > 0 ? (
                options.map((option) => {
                  const optionLabel =
                    option.id === NO_FILE_EXTENSION
                      ? t('Files without extension')
                      : option.id.toUpperCase();
                  const selected = draft.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${optionLabel}, ${t('{count} files', {
                        count: option.count,
                      })}`}
                      className={classNames(classes.chip, {
                        [classes.chipSelected]: selected,
                      })}
                      onClick={this.toggle(option.id)}
                    >
                      {selected && <MaterialSymbol name="check" size={18} />}
                      {optionLabel}
                      <span className={classes.chipCount}>{option.count}</span>
                    </button>
                  );
                })
              ) : (
                <p className={classes.typeFilterEmpty}>
                  {t('No file types in this folder')}
                </p>
              )}
            </div>

            <div className={classes.dateFilterActions}>
              <M3Button
                variant="text"
                onClick={this.clear}
                disabled={!active && draft.length === 0}
              >
                {t('Reset')}
              </M3Button>
              <div>
                <M3Button variant="text" onClick={this.close}>
                  {t('Cancel')}
                </M3Button>
                <M3Button variant="filled" icon="check" onClick={this.apply}>
                  {t('Apply filter')}
                </M3Button>
              </div>
            </div>
          </div>
        </Popover>
      </>
    );
  }
}

export default withStyles(styles)(FileExplorerTypeFilter);
