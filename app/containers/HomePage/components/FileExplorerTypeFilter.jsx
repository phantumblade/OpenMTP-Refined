import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/FileExplorerSearchBar';
import SelectionCheckbox from '../../../components/SelectionCheckbox';
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
              <FilterListIcon />
              <div>
                <h3>{t('Filter files by type')}</h3>
                <p>{t('Sorting will remain unchanged')}</p>
              </div>
            </div>

            <div className={classes.typeFilterList}>
              {options.length > 0 ? (
                options.map((option) => {
                  const optionLabel =
                    option.id === NO_FILE_EXTENSION
                      ? t('Files without extension')
                      : option.id.toUpperCase();
                  const selected = draft.includes(option.id);

                  return (
                    <FormControlLabel
                      key={option.id}
                      className={`${classes.typeFilterOption} ${
                        selected ? classes.typeFilterOptionSelected : ''
                      }`}
                      control={
                        <SelectionCheckbox
                          size="small"
                          checked={selected}
                          onChange={this.toggle(option.id)}
                          inputProps={{
                            'aria-label': `${optionLabel}, ${t(
                              '{count} files',
                              { count: option.count }
                            )}`,
                          }}
                        />
                      }
                      label={
                        <span className={classes.typeFilterOptionLabel}>
                          <span>{optionLabel}</span>
                          <span>{option.count}</span>
                        </span>
                      }
                    />
                  );
                })
              ) : (
                <p className={classes.typeFilterEmpty}>
                  {t('No file types in this folder')}
                </p>
              )}
            </div>

            <div className={classes.dateFilterActions}>
              <Button
                onClick={this.clear}
                disabled={!active && draft.length === 0}
              >
                {t('Reset')}
              </Button>
              <div>
                <Button onClick={this.close}>{t('Cancel')}</Button>
                <Button
                  color="secondary"
                  variant="contained"
                  disableElevation
                  onClick={this.apply}
                >
                  {t('Apply filter')}
                </Button>
              </div>
            </div>
          </div>
        </Popover>
      </>
    );
  }
}

export default withStyles(styles)(FileExplorerTypeFilter);
