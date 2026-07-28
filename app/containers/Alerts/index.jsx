import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { clearAlert } from './actions';
import Snackbars from '../../components/Snackbars';
import { translate } from '../../i18n';

class Alerts extends Component {
  _handleClose = () => {
    const { actionCreateClearAlert } = this.props;

    actionCreateClearAlert();
  };

  render() {
    const { Alerts, appLanguage } = this.props;
    const { message, variant, autoHideDuration } = Alerts;
    const translatedMessage = message ? translate(appLanguage, message) : null;

    return (
      translatedMessage && (
        <Snackbars
          OnSnackBarsCloseAlerts={() => this._handleClose()}
          message={translatedMessage}
          variant={variant}
          autoHideDuration={autoHideDuration}
          appLanguage={appLanguage}
        />
      )
    );
  }
}

const mapDispatchToProps = (dispatch, __) =>
  bindActionCreators(
    {
      actionCreateClearAlert: () => (_, __) => {
        dispatch(clearAlert());
      },
    },
    dispatch
  );

const mapStateToProps = (state, __) => {
  return {
    Alerts: state.Alerts,
    appLanguage: state.Settings.appLanguage,
  };
};

export default withReducer(
  'Alerts',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(Alerts));
