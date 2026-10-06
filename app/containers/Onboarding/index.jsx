import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
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
    const t = (key) => translate(appLanguage, key);

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        className={styles.root}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby="onboaring-dialogbox"
        onClose={() => this._handleClose()}
        open={fireOnboarding}
      >
        <DialogTitle>{t('Welcome to OpenMTP Refined')}</DialogTitle>
        <DialogContent>
          <div className={styles.contentBox}>
            <WhatsNew hideTitle={false} appLanguage={appLanguage} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this._handleClose()}
            color="primary"
            className={styles.btnPositive}
          >
            {t('Close')}
          </Button>
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
