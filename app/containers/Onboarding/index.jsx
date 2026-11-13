import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { styles } from './styles';
import { setOnboarding } from '../Settings/actions';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from '../Alerts/reducers';
import {
  makeAppLanguage,
  makeFreshInstall,
  makeOnboarding,
} from '../Settings/selectors';
import WhatsNew from './components/WhatsNew';
import PhotoBackupGuide from '../HomePage/components/PhotoBackupGuide';
import M3Button from '../../components/m3/M3Button';
import { imgsrc } from '../../utils/imgsrc';
import { APP_VERSION } from '../../constants/meta';
import { latestUpdatePushVersion } from '../../constants/onboarding';
import { translate } from '../../i18n';

class Onboarding extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fireOnboarding: false,
      guideOpen: false,
    };
  }

  componentDidMount() {
    const { onboarding } = this.props;
    const { lastFiredVersion } = onboarding;

    this.setState({
      fireOnboarding: latestUpdatePushVersion !== lastFiredVersion,
    });
  }

  _handleClose = () => {
    const { actionCreateOnboarding } = this.props;

    this.setState({
      fireOnboarding: false,
    });

    actionCreateOnboarding({ lastFiredVersion: latestUpdatePushVersion });
  };

  render() {
    const { classes: styles, appLanguage } = this.props;
    const { fireOnboarding, guideOpen } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);

    return (
      <>
        <Dialog
          className={styles.root}
          classes={{ paper: styles.paper }}
          maxWidth={false}
          scroll="paper"
          aria-labelledby="onboaring-dialogbox"
          // Escape or a click outside closes it, like "Get started"
          onClose={() => this._handleClose()}
          open={fireOnboarding}
        >
          <div className={styles.hero}>
            <img
              className={styles.heroIcon}
              src={imgsrc('app-icon.png')}
              alt=""
            />
            <div className={styles.heroText}>
              <h2 id="onboaring-dialogbox" className={styles.headline}>
                {t("What's new in OpenMTP Refined {version}", {
                  version: APP_VERSION,
                })}
              </h2>
              <p className={styles.supportingText}>
                {t(
                  'Photo backup, a Transfers panel and a more colourful look.'
                )}
              </p>
            </div>
          </div>
          <DialogContent className={styles.content}>
            <WhatsNew
              appLanguage={appLanguage}
              onShowBackupGuide={() => this.setState({ guideOpen: true })}
            />
          </DialogContent>
          <DialogActions className={styles.actions}>
            <M3Button
              variant="filled"
              size="small"
              onClick={() => this._handleClose()}
            >
              {t('Get started')}
            </M3Button>
          </DialogActions>
        </Dialog>
        <PhotoBackupGuide
          open={guideOpen}
          appLanguage={appLanguage}
          canStart={false}
          onClose={() => this.setState({ guideOpen: false })}
        />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch, __) =>
  bindActionCreators(
    {
      actionCreateOnboarding:
        ({ ...data }) =>
        (_, getState) => {
          dispatch(setOnboarding({ ...data }, getState));
        },
    },
    dispatch
  );

const mapStateToProps = (state, __) => {
  return {
    onboarding: makeOnboarding(state),
    freshInstall: makeFreshInstall(state),
    appLanguage: makeAppLanguage(state),
  };
};

export default withReducer(
  'App',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Onboarding)));
