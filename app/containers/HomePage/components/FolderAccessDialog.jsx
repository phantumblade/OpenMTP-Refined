import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import M3Button from '../../../components/m3/M3Button';
import { styles } from '../styles/FolderAccessDialog';
import {
  listDirectory,
  saveFolderAccess,
  setFolderAccessRequest,
} from '../actions';
import { makeCurrentBrowsePath } from '../selectors';
import { makeAppLanguage } from '../../Settings/selectors';
import {
  FOLDER_ACCESS,
  PROTECTED_FOLDERS,
  SYSTEM_SETTINGS_FILES_AND_FOLDERS,
  protectedFolderFor,
} from '../../../helpers/folderAccess';
import { PATHS } from '../../../constants/paths';
import { DEVICE_TYPE } from '../../../enums';
import { openExternalUrl } from '../../../utils/url';
import { translate } from '../../../i18n';

// Material 3 dialog shown before macOS asks for a protected folder (and when
// the folder is closed to OpenMTP), so the system prompt never comes as a
// surprise and the user decides folder by folder.
class FolderAccessDialog extends PureComponent {
  close = () => {
    const { request, currentBrowsePath, actionSetRequest, actionList } =
      this.props;

    actionSetRequest(null);

    // stuck inside the closed folder (e.g. it was the last one open at
    // launch): show the home folder instead of an empty pane
    const current = currentBrowsePath[DEVICE_TYPE.local];

    if (
      request &&
      protectedFolderFor(current)?.id === request.folderId &&
      current !== PATHS.homeDir
    ) {
      actionList({
        filePath: PATHS.homeDir,
        ignoreHidden: request.ignoreHidden,
      });
    }
  };

  allow = () => {
    const { request, actionSetRequest, actionList } = this.props;

    actionSetRequest(null);
    actionList({
      filePath: request.filePath,
      ignoreHidden: request.ignoreHidden,
      skipAccessCheck: true,
    });
  };

  block = () => {
    const { request, actionSaveAccess } = this.props;

    actionSaveAccess(request.folderId, FOLDER_ACCESS.blocked);
    this.close();
  };

  render() {
    const { classes: styles, request, appLanguage } = this.props;
    const t = (key, values) => translate(appLanguage, key, values);
    const folder = request
      ? PROTECTED_FOLDERS.find(({ id }) => id === request.folderId)
      : null;
    const status = request?.status;
    const name = folder ? t(folder.label) : '';
    const isDenied = status === FOLDER_ACCESS.denied;
    const isBlocked = status === FOLDER_ACCESS.blocked;

    let title = t('Let OpenMTP open “{name}”?', { name });
    let body = t(
      'macOS protects this folder. When you continue, macOS asks whether OpenMTP can open it: choose Allow.'
    );

    if (isBlocked) {
      title = t('“{name}” is closed to OpenMTP', { name });
      body = t(
        'You chose not to let OpenMTP open this folder. You can allow it now, or later in Settings → Privacy.'
      );
    } else if (isDenied) {
      title = t('macOS blocked “{name}”', { name });
      body = t(
        'Open System Settings → Privacy & Security → Files and Folders, turn on this folder for OpenMTP, then try again.'
      );
    }

    return (
      <Dialog
        open={Boolean(folder)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.paper }}
        onClose={this.close}
        aria-labelledby="folder-access-title"
      >
        <div className={styles.hero}>
          <M3Shape
            shape="Cookie9Sided"
            size={56}
            color="currentColor"
            className={isDenied ? styles.shapeError : styles.shape}
          >
            <MaterialSymbol
              name={isDenied || isBlocked ? 'lock' : folder?.icon || 'folder'}
              size={28}
              fill={1}
              className={isDenied ? styles.iconError : styles.icon}
            />
          </M3Shape>
          <h2 id="folder-access-title" className={styles.headline}>
            {title}
          </h2>
        </div>
        <DialogContent className={styles.content}>
          <p className={styles.body}>{body}</p>
          {!isDenied && (
            <ul className={styles.facts}>
              <li>
                <MaterialSymbol name="visibility" size={20} />
                {t(
                  'OpenMTP reads it only when you open it, to show and copy your files.'
                )}
              </li>
              <li>
                <MaterialSymbol name="cloud_off" size={20} />
                {t(
                  'Nothing leaves your Mac except the files you copy to your phone.'
                )}
              </li>
            </ul>
          )}
        </DialogContent>
        <DialogActions className={styles.actions}>
          {status === FOLDER_ACCESS.ask && (
            <M3Button variant="text" onClick={this.block}>
              {t("Don't allow")}
            </M3Button>
          )}
          <span className={styles.spacer} />
          <M3Button variant="text" onClick={this.close}>
            {status === FOLDER_ACCESS.ask ? t('Not now') : t('Close')}
          </M3Button>
          {isDenied && (
            <M3Button
              variant="tonal"
              icon="open_in_new"
              onClick={(event) =>
                openExternalUrl(SYSTEM_SETTINGS_FILES_AND_FOLDERS, event)
              }
            >
              {t('System Settings')}
            </M3Button>
          )}
          <M3Button variant="filled" onClick={this.allow}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isDenied ? t('Try again') : isBlocked ? t('Allow') : t('Continue')}
          </M3Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  request: state.Home?.folderAccessRequest || null,
  currentBrowsePath: makeCurrentBrowsePath(state),
  appLanguage: makeAppLanguage(state),
});

const mapDispatchToProps = (dispatch) => ({
  actionSetRequest: (request) => dispatch(setFolderAccessRequest(request)),
  actionSaveAccess: (folderId, status) =>
    dispatch(saveFolderAccess(folderId, status)),
  actionList: (data) =>
    dispatch((_, getState) =>
      dispatch(listDirectory(data, DEVICE_TYPE.local, getState))
    ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FolderAccessDialog));
