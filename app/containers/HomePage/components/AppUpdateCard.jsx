import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import M3Button from '../../../components/m3/M3Button';
import M3Shape from '../../../components/m3/M3Shape';
import M3WavyProgress from '../../../components/m3/M3WavyProgress';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { styles } from '../styles/AppUpdateCard';
import { translate } from '../../../i18n';
import {
  getAppUpdateStatus,
  installAppUpdate,
  openAppUpdateNotes,
  subscribeToAppUpdateStatus,
} from '../../../helpers/appUpdateStatus';

// The new version, at the bottom of the side menu above the app's own card:
// found, downloading (with its progress) or ready to install with one click.
// It springs in each time the menu opens, so it is noticed without nagging.
class AppUpdateCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { update: getAppUpdateStatus() };
  }

  componentDidMount() {
    this.unsubscribe = subscribeToAppUpdateStatus((update) =>
      this.setState({ update })
    );
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { classes, appLanguage } = this.props;
    const { update } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const { state, version, percent } = update;

    if (!['available', 'downloading', 'ready'].includes(state)) {
      return null;
    }

    const title = {
      available: t('OpenMTP {version} is available', { version }),
      downloading: t('Downloading OpenMTP {version}', { version }),
      ready: t('OpenMTP {version} is ready', { version }),
    }[state];

    return (
      <section className={classes.card} aria-live="polite">
        <div className={classes.header}>
          <M3Shape
            shape="Cookie9Sided"
            size={44}
            color="currentColor"
            className={classes.shape}
          >
            <MaterialSymbol
              name={state === 'ready' ? 'upgrade' : 'download'}
              size={24}
              fill={1}
              weight={600}
              className={classes.icon}
            />
          </M3Shape>
          <div className={classes.text}>
            <span className={classes.label}>{t('New version')}</span>
            <span className={classes.title}>{title}</span>
          </div>
        </div>

        {state === 'downloading' ? (
          <div className={classes.progress}>
            <M3WavyProgress
              value={percent}
              aria-label={t('Download progress')}
            />
            <span className={classes.percent}>{percent}%</span>
          </div>
        ) : (
          <p className={classes.description}>
            {state === 'ready'
              ? t(
                  'It takes a few seconds: OpenMTP closes and opens again, up to date.'
                )
              : t('New features and fixes are waiting for you.')}
          </p>
        )}

        <div className={classes.actions}>
          <M3Button
            variant="text"
            size="small"
            className={classes.notes}
            onClick={() => openAppUpdateNotes(version)}
          >
            {t("What's new")}
          </M3Button>
          {state !== 'downloading' && (
            <M3Button
              variant="filled"
              size="small"
              icon={state === 'ready' ? 'restart_alt' : 'download'}
              className={classes.install}
              onClick={installAppUpdate}
            >
              {t(state === 'ready' ? 'Install and Relaunch' : 'Update')}
            </M3Button>
          )}
        </div>
      </section>
    );
  }
}

export default withStyles(styles)(AppUpdateCard);
