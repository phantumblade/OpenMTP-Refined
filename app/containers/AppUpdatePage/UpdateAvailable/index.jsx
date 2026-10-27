import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Helmet } from 'react-helmet';
import sanitizeHtml from 'sanitize-html';
import { styles } from './styles';
import releaseNotesStyles from './styles/release-notes.scss';
import { undefinedOrNull } from '../../../utils/funcs';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { setStyle } from '../../../utils/styles';
import { getAppThemeMode } from '../../../helpers/theme';
import { getCurrentThemePalette } from '../../App/styles';
import { translateWithSetting as t } from '../../../helpers/translateWithSetting';

class AppUpdatePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      releaseInfo: {},
    };

    this.sanitizeHtmlConfig = {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'p',
        'ul',
        'ol',
        'nl',
        'li',
        'b',
        'i',
        'strong',
        'em',
        'strike',
        'code',
        'hr',
        'br',
        'div',
        'caption',
        'pre',
      ],
    };
  }

  componentWillMount() {
    ipcRenderer.on('appUpdatesUpdateAvailableCommunication', (event, args) => {
      this.setState({ releaseInfo: { ...args } });
    });
  }

  componentDidMount() {
    const appThemeMode = getAppThemeMode();
    const { nativeSystemColor } = getCurrentThemePalette(appThemeMode);

    setStyle(document.body, {
      background: `${nativeSystemColor} !important`,
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'appUpdatesUpdateAvailableCommunication',
      () => {}
    );
    ipcRenderer.removeListener('appUpdatesUpdateAvailableReply', () => {});
  }

  _handleBtnClick = ({ confirm }) => {
    ipcRenderer.send('appUpdatesUpdateAvailableReply', { confirm });
    window.close();
  };

  render() {
    const { classes: styles } = this.props;
    const { releaseInfo } = this.state;

    if (undefinedOrNull(releaseInfo) || Object.keys(releaseInfo).length < 1) {
      return (
        <div>
          <Helmet titleTemplate="%s">
            <title>{t('Software Update')}</title>
          </Helmet>
          <Typography variant="subtitle1" className={styles.loadingText}>
            {t('Fetching update information…')}
          </Typography>
        </div>
      );
    }

    const { releaseName, releaseNotes } = releaseInfo;
    const sanitizedReleaseNotesHtml = sanitizeHtml(
      releaseNotes,
      this.sanitizeHtmlConfig
    );

    return (
      <div className={styles.root}>
        <Helmet titleTemplate="%s">
          <title>{t('Software Update')}</title>
        </Helmet>
        <Typography variant="subtitle1" className={styles.title}>
          {t('A new version of {app} is available!', { app: APP_NAME })}
        </Typography>
        <Typography variant="caption">
          {t(
            '{release} is now available – you have {installed}. Would you like to download it now?',
            { release: releaseName, installed: APP_VERSION }
          )}
        </Typography>

        <Typography variant="body2" className={styles.releaseNotes}>
          {t('Release notes:')}
        </Typography>

        <div className={styles.scrollContainer}>
          {/* eslint-disable react/no-danger */}
          <div
            className={`${releaseNotesStyles.releaseNotes}`}
            dangerouslySetInnerHTML={{
              __html: sanitizedReleaseNotesHtml,
            }}
          />
          {/* eslint-enable react/no-danger */}
        </div>

        <div className={styles.btnWrapper}>
          <Button
            onClick={() => this._handleBtnClick({ confirm: false })}
            color="secondary"
            className={styles.btnNegative}
          >
            {t('No')}
          </Button>
          <Button
            onClick={() => this._handleBtnClick({ confirm: true })}
            color="primary"
            className={styles.btnPositive}
          >
            {t('Yes')}
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AppUpdatePage);
