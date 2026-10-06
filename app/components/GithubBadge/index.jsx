import React, { PureComponent } from 'react';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../m3/MaterialSymbol';
import M3Button from '../m3/M3Button';
import { openExternalUrl } from '../../utils/url';
import { translate } from '../../i18n';
import {
  loadGithubProfile,
  summarizeGithubData,
} from '../../helpers/githubProfile';
import { styles } from './styles';

// GitHub logo (Phosphor Icons "github-logo" duotone, MIT), drawn with
// currentColor so it follows the theme.
export function GithubMark({ size = 22 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
    >
      <path
        opacity="0.2"
        d="M208,104v8a48,48,0,0,1-48,48H136a32,32,0,0,1,32,32v40H104V192a32,32,0,0,1,32-32H112a48,48,0,0,1-48-48v-8a49.28,49.28,0,0,1,8.51-27.3A51.92,51.92,0,0,1,76,32a52,52,0,0,1,43.83,24h32.34A52,52,0,0,1,196,32a51.92,51.92,0,0,1,3.49,44.7A49.28,49.28,0,0,1,208,104Z"
      />
      <path d="M208.3,75.68A59.74,59.74,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58,58,0,0,0,208.3,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.76,41.76,0,0,1,200,104Z" />
    </svg>
  );
}

const OPEN_DELAY_MS = 250;
const CLOSE_DELAY_MS = 200;

const relativeTime = (iso, language) => {
  if (!iso) {
    return null;
  }

  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
  const format = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

  if (Math.abs(days) < 1) {
    return format.format(0, 'day');
  }

  if (Math.abs(days) < 30) {
    return format.format(days, 'day');
  }

  return format.format(Math.round(days / 30), 'month');
};

class GithubBadge extends PureComponent {
  constructor(props) {
    super(props);

    this.anchorRef = React.createRef();
    this.state = {
      open: false,
      data: summarizeGithubData(null, null),
      fresh: false,
      loading: false,
    };
  }

  componentWillUnmount() {
    this.clearTimers();
  }

  clearTimers = () => {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
  };

  load = async () => {
    this.setState({ loading: true });

    const { data, fresh } = await loadGithubProfile();

    this.setState({ data, fresh, loading: false });
  };

  scheduleOpen = () => {
    this.clearTimers();
    this.openTimer = setTimeout(() => {
      this.setState({ open: true });
      this.load();
    }, OPEN_DELAY_MS);
  };

  scheduleClose = () => {
    this.clearTimers();
    this.closeTimer = setTimeout(
      () => this.setState({ open: false }),
      CLOSE_DELAY_MS
    );
  };

  renderStat = (icon, value, label) => {
    const { classes } = this.props;

    return (
      <span className={classes.stat} key={label}>
        <MaterialSymbol name={icon} size={18} className={classes.statIcon} />
        <span className={classes.statValue}>{value ?? '—'}</span>
        <span className={classes.statLabel}>{label}</span>
      </span>
    );
  };

  render() {
    const { classes, appLanguage } = this.props;
    const { open, data, fresh, loading } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const updated = relativeTime(data.pushedAt, appLanguage);

    return (
      <>
        <button
          ref={this.anchorRef}
          type="button"
          className={classes.badge}
          aria-label={t('Made by {name} on GitHub', { name: data.name })}
          onMouseEnter={this.scheduleOpen}
          onMouseLeave={this.scheduleClose}
          onFocus={this.scheduleOpen}
          onBlur={this.scheduleClose}
          onClick={(event) => openExternalUrl(data.repoUrl, event)}
        >
          <GithubMark />
        </button>

        <Popper
          open={open}
          anchorEl={this.anchorRef.current}
          placement="top-end"
          transition
          className={classes.popper}
          modifiers={{ offset: { offset: '0, 10' } }}
        >
          {({ TransitionProps }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'bottom right' }}
            >
              <div
                className={classes.card}
                onMouseEnter={this.clearTimers}
                onMouseLeave={this.scheduleClose}
              >
                <div className={classes.identity}>
                  {data.avatarUrl ? (
                    <img
                      className={classes.avatar}
                      src={data.avatarUrl}
                      alt=""
                    />
                  ) : (
                    <span className={classes.avatarFallback}>
                      <GithubMark size={26} />
                    </span>
                  )}
                  <div className={classes.identityText}>
                    <span className={classes.name}>{data.name}</span>
                    <span className={classes.login}>@{data.login}</span>
                  </div>
                </div>

                <div className={classes.repo}>
                  <MaterialSymbol
                    name="folder_code"
                    size={20}
                    className={classes.repoIcon}
                  />
                  <div>
                    <span className={classes.repoName}>{data.repoName}</span>
                    {data.repoDescription && (
                      <span className={classes.repoDescription}>
                        {data.repoDescription}
                      </span>
                    )}
                  </div>
                </div>

                <div className={classes.stats}>
                  {this.renderStat('star', data.stars, t('Stars'))}
                  {this.renderStat('fork_right', data.forks, t('Forks'))}
                  {this.renderStat('book', data.publicRepos, t('Repositories'))}
                  {this.renderStat('group', data.followers, t('Followers'))}
                </div>

                <div className={classes.meta}>
                  {loading && t('Loading…')}
                  {!loading &&
                    !fresh &&
                    t('GitHub statistics are unavailable offline')}
                  {!loading &&
                    fresh &&
                    updated &&
                    t('Updated {when}', { when: updated })}
                </div>

                <div className={classes.actions}>
                  <M3Button
                    variant="text"
                    size="small"
                    icon="person"
                    onClick={(event) => openExternalUrl(data.profileUrl, event)}
                  >
                    {t('Profile')}
                  </M3Button>
                  <M3Button
                    variant="tonal"
                    size="small"
                    icon="open_in_new"
                    onClick={(event) => openExternalUrl(data.repoUrl, event)}
                  >
                    {t('Repository')}
                  </M3Button>
                </div>
              </div>
            </Grow>
          )}
        </Popper>
      </>
    );
  }
}

export default withStyles(styles)(GithubBadge);
