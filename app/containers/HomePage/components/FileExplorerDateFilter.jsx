import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import DateRangeOutlinedIcon from '@material-ui/icons/DateRangeOutlined';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/FileExplorerSearchBar';
import { translate } from '../../../i18n';
import {
  EMPTY_FILE_DATE_FILTER,
  FILE_DATE_FIELD,
  isFileDateFilterActive,
  isFileDateFilterValid,
} from '../../../helpers/fileDateFilter';

class FileExplorerDateFilter extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      draft: { ...props.value },
    };
  }

  componentDidUpdate(_, prevState) {
    const { value, creationDateAvailable } = this.props;
    const { anchorEl, draft } = this.state;

    if (prevState.anchorEl && !anchorEl) {
      this.setState({ draft: { ...value } }); // eslint-disable-line react/no-did-update-set-state
    }

    if (!creationDateAvailable && draft.field === FILE_DATE_FIELD.created) {
      this.setState((state) => ({
        // eslint-disable-next-line react/no-did-update-set-state
        draft: { ...state.draft, field: FILE_DATE_FIELD.modified },
      }));
    }
  }

  open = (event) => {
    const { value, creationDateAvailable } = this.props;
    const field = creationDateAvailable
      ? value.field
      : FILE_DATE_FIELD.modified;

    this.setState({
      anchorEl: event.currentTarget,
      draft: { ...value, field },
    });
  };

  close = () => this.setState({ anchorEl: null });

  updateDraft = (name) => (event) => {
    const { value } = event.target;

    this.setState((state) => ({
      draft: { ...state.draft, [name]: value },
    }));
  };

  apply = () => {
    const { onChange } = this.props;
    const { draft } = this.state;

    if (!isFileDateFilterValid(draft)) {
      return;
    }

    onChange({ ...draft });
    this.close();
  };

  clear = () => {
    const { onChange } = this.props;
    const next = { ...EMPTY_FILE_DATE_FILTER };

    onChange(next);
    this.setState({ draft: next, anchorEl: null });
  };

  render() {
    const {
      classes,
      value,
      disabled,
      creationDateAvailable,
      appLanguage,
      deviceType,
    } = this.props;
    const { anchorEl, draft } = this.state;
    const t = (key) => translate(appLanguage, key);
    const active = isFileDateFilterActive(value);
    const valid = isFileDateFilterValid(draft);
    const labelId = `${deviceType}-date-filter-field-label`;

    return (
      <>
        <Tooltip title={t(active ? 'Date filter active' : 'Filter by date')}>
          <IconButton
            size="small"
            disableRipple
            disabled={disabled}
            aria-label={t(active ? 'Date filter active' : 'Filter by date')}
            aria-haspopup="dialog"
            aria-expanded={Boolean(anchorEl)}
            className={`${classes.filterButton} ${
              active ? classes.filterButtonActive : ''
            }`}
            onClick={this.open}
          >
            <DateRangeOutlinedIcon />
            {active && <span className={classes.filterActiveDot} />}
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          classes={{ paper: classes.dateFilterPaper }}
        >
          <div
            className={classes.dateFilterContent}
            role="dialog"
            aria-label={t('Filter files by date')}
          >
            <div className={classes.dateFilterHeader}>
              <DateRangeOutlinedIcon />
              <div>
                <h3>{t('Filter files by date')}</h3>
                <p>{t('Folders remain visible')}</p>
              </div>
            </div>

            <FormControl
              fullWidth
              variant="outlined"
              margin="dense"
              color="secondary"
              className={classes.dateFilterField}
            >
              <InputLabel id={labelId}>{t('Date field')}</InputLabel>
              <Select
                labelId={labelId}
                value={draft.field}
                onChange={this.updateDraft('field')}
                label={t('Date field')}
              >
                <MenuItem value={FILE_DATE_FIELD.modified}>
                  {t('Modification date')}
                </MenuItem>
                <MenuItem
                  value={FILE_DATE_FIELD.created}
                  disabled={!creationDateAvailable}
                >
                  {t('Creation date')}
                </MenuItem>
              </Select>
            </FormControl>

            {!creationDateAvailable && (
              <p className={classes.dateFilterNotice}>
                {t('Creation date is unavailable over MTP')}
              </p>
            )}

            <div className={classes.dateFilterDates}>
              <TextField
                type="date"
                variant="outlined"
                margin="dense"
                color="secondary"
                label={t('From date')}
                value={draft.from}
                onChange={this.updateDraft('from')}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: draft.to || undefined }}
                error={!valid}
              />
              <TextField
                type="date"
                variant="outlined"
                margin="dense"
                color="secondary"
                label={t('To date')}
                value={draft.to}
                onChange={this.updateDraft('to')}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: draft.from || undefined }}
                error={!valid}
              />
            </div>

            {!valid && (
              <p className={classes.dateFilterError} role="alert">
                {t('Start date must be before end date')}
              </p>
            )}

            <div className={classes.dateFilterActions}>
              <Button
                onClick={this.clear}
                disabled={!active && !draft.from && !draft.to}
              >
                {t('Reset')}
              </Button>
              <div>
                <Button onClick={this.close}>{t('Cancel')}</Button>
                <Button
                  color="secondary"
                  variant="contained"
                  disableElevation
                  disabled={!valid}
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

export default withStyles(styles)(FileExplorerDateFilter);
