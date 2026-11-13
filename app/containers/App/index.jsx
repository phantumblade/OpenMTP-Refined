import { hot } from 'react-hot-loader/root';
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { materialUiTheme, styles } from './styles';
import Alerts from '../Alerts';
import Titlebar from './components/Titlebar';
import ErrorBoundary from '../ErrorBoundary';
import Routes from '../../routing';
import { bootLoader } from '../../helpers/bootHelper';
import { settingsStorage } from '../../helpers/storageHelper';
import { upgradeSavedLook } from '../../helpers/designGeneration';
import SettingsDialog from '../Settings';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { copyJsonFileToSettings, freshInstall } from '../Settings/actions';
import {
  makeAppThemeMode,
  makeAppThemeModeSettings,
  makeAppLanguage,
  makeAppFontFamily,
  makeAppAccentColor,
  makeAppColorStyle,
  makeAppUiScale,
} from '../Settings/selectors';
import { applyUiScale } from '../../helpers/uiScale';
import { getAppThemeMode } from '../../helpers/theme';
import { getMainWindowRendererProcess } from '../../helpers/windowHelper';
import { log } from '../../utils/log';
import { analyticsService } from '../../services/analytics';

class App extends Component {
  constructor(props) {
    super(props);

    this.mainWindowRendererProcess = getMainWindowRendererProcess();

    this.allowWritingJsonToSettings = false;
  }

  componentWillMount() {
    try {
      upgradeSavedLook();
      this.setFreshInstall();

      if (this.allowWritingJsonToSettings) {
        this.writeJsonToSettings();
      }

      this.runAnalytics();
    } catch (e) {
      log.error(e, `App -> componentWillMount`);
    }
  }

  componentDidMount() {
    try {
      const { appUiScale } = this.props;

      ipcRenderer.on('nativeThemeUpdated', this.nativeThemeUpdatedEvent);
      applyUiScale(appUiScale);

      bootLoader.cleanRotationFiles();
    } catch (e) {
      log.error(e, `App -> componentDidMount`);
    }
  }

  componentDidUpdate(prevProps) {
    const { appUiScale } = this.props;

    if (appUiScale !== prevProps.appUiScale) {
      applyUiScale(appUiScale);
    }
  }

  componentWillUnmount() {
    this.deregisterAccelerators();
    ipcRenderer.removeListener(
      'nativeThemeUpdated',
      this.nativeThemeUpdatedEvent
    );

    this.mainWindowRendererProcess.webContents.removeListener(
      'nativeThemeUpdated',
      () => {}
    );
  }

  nativeThemeUpdatedEvent = () => {
    // force update the component
    this.setState({});
  };

  getMuiTheme = () => {
    const {
      appThemeModeSettings,
      appFontFamily,
      appColorStyle,
      appAccentColor,
    } = this.props;
    const appThemeMode = getAppThemeMode(appThemeModeSettings);

    return createMuiTheme(
      materialUiTheme({
        appThemeMode,
        appFontFamily,
        appColorStyle,
        appAccentColor,
      })
    );
  };

  setFreshInstall() {
    try {
      const { actionCreateFreshInstall } = this.props;
      const setting = settingsStorage.getItems(['freshInstall']);
      let isFreshInstall = 0;

      switch (setting.freshInstall) {
        case undefined:
        case null:
          // app was just installed
          isFreshInstall = 1;
          break;
        case 1:
          // second boot after installation
          isFreshInstall = 0;
          break;
        case -1:
          // isFreshInstall was reset
          isFreshInstall = 1;
          break;
        case 0:
        default:
          // more than 2 boot ups have occured
          isFreshInstall = 0;
          this.allowWritingJsonToSettings = true;

          return null;
      }

      actionCreateFreshInstall({ isFreshInstall });
    } catch (e) {
      log.error(e, `App -> setFreshInstall`);
    }
  }

  writeJsonToSettings() {
    try {
      const { actionCreateCopyJsonFileToSettings } = this.props;
      const settingsFromStorage = settingsStorage.getAll();

      actionCreateCopyJsonFileToSettings({ ...settingsFromStorage });
    } catch (e) {
      log.error(e, `App -> writeJsonToSettings`);
    }
  }

  async runAnalytics() {
    await analyticsService.init();
  }

  render() {
    const { classes: styles, appLanguage } = this.props;
    const muiTheme = this.getMuiTheme();

    document.documentElement.lang = appLanguage;

    return (
      <div className={styles.root}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <Titlebar />
          <Alerts />
          <ErrorBoundary>
            <SettingsDialog />
            <Routes />
          </ErrorBoundary>
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      actionCreateCopyJsonFileToSettings:
        ({ ...data }) =>
        (_, __) => {
          dispatch(copyJsonFileToSettings({ ...data }));
        },

      actionCreateFreshInstall:
        ({ ...data }) =>
        (_, getState) => {
          dispatch(freshInstall({ ...data }, getState));
        },
    },
    dispatch
  );

const mapStateToProps = (state) => {
  return {
    appThemeModeSettings: makeAppThemeModeSettings(state),
    appThemeMode: makeAppThemeMode(state),
    appLanguage: makeAppLanguage(state),
    appFontFamily: makeAppFontFamily(state),
    appColorStyle: makeAppColorStyle(state),
    appAccentColor: makeAppAccentColor(state),
    appUiScale: makeAppUiScale(state),
  };
};

export default withReducer(
  'App',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(hot(App))));
