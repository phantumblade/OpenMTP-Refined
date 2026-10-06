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
    const { fireOnboarding } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        className={styles.root}
        classes={{ paper: styles.paper }}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby="onboaring-dialogbox"
        onClose={() => this._handleClose()}
        open={fireOnboarding}
      >
        <div className={styles.hero}>
          <img
            className={styles.heroIcon}
            src={imgsrc('app-icon.png')}
            alt=""
          />
          <h2 className={styles.headline}>{t('Welcome to OpenMTP Refined')}</h2>
          <p className={styles.supportingText}>
            {t("Here's what's new in version {version}.", {
              version: APP_VERSION,
            })}
          </p>
        </div>
        <DialogContent className={styles.content}>
          <WhatsNew appLanguage={appLanguage} />
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
