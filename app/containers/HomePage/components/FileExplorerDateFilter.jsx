import React, { PureComponent } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import M3Button from '../../../components/m3/M3Button';
import M3DateRangePicker from '../../../components/m3/M3DateRangePicker';
import M3Shape from '../../../components/m3/M3Shape';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { quickRanges } from '../../../helpers/dateLocale';
import { DateRangeOutlined as DateRangeOutlinedIcon } from '../../../components/m3/symbolIcons';
import { styles } from '../styles/FileExplorerSearchBar';
import { translate } from '../../../i18n';
import {
  EMPTY_FILE_DATE_FILTER,
  FILE_DATE_FIELD,
  isFileDateFilterActive,
  isFileDateFilterValid,
} from '../../../helpers/fileDateFilter';

const QUICK_RANGE_LABELS = {
  today: 'Today',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  thisYear: 'This year',
};

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

  setDraft = (patch) => {
    this.setState((state) => ({ draft: { ...state.draft, ...patch } }));
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
    const { classes, value, disabled, creationDateAvailable, appLanguage } =
      this.props;
    const { anchorEl, draft } = this.state;
    const t = (key) => translate(appLanguage, key);
    const active = isFileDateFilterActive(value);
    const valid = isFileDateFilterValid(draft);
    const ranges = quickRanges();

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
              <M3Shape
                shape="Cookie9Sided"
                size={44}
                color="currentColor"
                className={classes.headerShape}
              >
                <MaterialSymbol
                  name="date_range"
                  size={22}
                  fill={1}
                  className={classes.headerIcon}
                />
              </M3Shape>
              <div>
                <h3>{t('Filter files by date')}</h3>
                <p>{t('Folders remain visible')}</p>
              </div>
            </div>

            <span className={classes.sectionLabel}>{t('Date field')}</span>
            <div className={classes.segmented} role="radiogroup">
              {[
                [
                  FILE_DATE_FIELD.modified,
                  'edit_calendar',
                  'Modification date',
                ],
                [FILE_DATE_FIELD.created, 'calendar_add_on', 'Creation date'],
              ].map(([field, icon, label]) => {
                const selected = draft.field === field;

                return (
                  <button
                    key={field}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={
                      field === FILE_DATE_FIELD.created &&
                      !creationDateAvailable
                    }
                    className={classNames(classes.segment, {
                      [classes.segmentSelected]: selected,
                    })}
                    onClick={() => this.setDraft({ field })}
                  >
                    <MaterialSymbol
                      name={selected ? 'check' : icon}
                      size={18}
                    />
                    {t(label)}
                  </button>
                );
              })}
            </div>
            {!creationDateAvailable && (
              <p className={classes.dateFilterNotice}>
                {t('Creation date is unavailable over MTP')}
              </p>
            )}

            <div className={classes.chips}>
              {Object.keys(QUICK_RANGE_LABELS).map((key) => {
                const range = ranges[key];
                const selected =
                  draft.from === range.from && draft.to === range.to;

                return (
                  <button
                    key={key}
                    type="button"
                    className={classNames(classes.chip, {
                      [classes.chipSelected]: selected,
                    })}
                    aria-pressed={selected}
                    onClick={() => this.setDraft(range)}
                  >
                    {selected && <MaterialSymbol name="check" size={18} />}
                    {t(QUICK_RANGE_LABELS[key])}
                  </button>
                );
              })}
            </div>

            <M3DateRangePicker
              from={draft.from}
              to={draft.to}
              language={appLanguage}
              fromLabel={t('From date')}
              toLabel={t('To date')}
              error={!valid}
              onChange={({ from, to }) => this.setDraft({ from, to })}
            />

            {!valid && (
              <p className={classes.dateFilterError} role="alert">
                {t('Start date must be before end date')}
              </p>
            )}

            <div className={classes.dateFilterActions}>
              <M3Button
                variant="text"
                onClick={this.clear}
                disabled={!active && !draft.from && !draft.to}
              >
                {t('Reset')}
              </M3Button>
              <div>
                <M3Button variant="text" onClick={this.close}>
                  {t('Cancel')}
                </M3Button>
                <M3Button
                  variant="filled"
                  icon="check"
                  disabled={!valid}
                  onClick={this.apply}
                >
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

export default withStyles(styles)(FileExplorerDateFilter);
