import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { promises as fsPromises } from 'fs';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Button from '../../../components/m3/M3Button';
import { saveFolderAccess } from '../../HomePage/actions';
import { makeFolderAccess } from '../selectors';
import {
  FOLDER_ACCESS,
  PROTECTED_FOLDERS,
  SYSTEM_SETTINGS_FILES_AND_FOLDERS,
  SYSTEM_SETTINGS_FULL_DISK_ACCESS,
  folderAccessStatus,
  hasFullDiskAccess,
  isPermissionError,
} from '../../../helpers/folderAccess';
import { openExternalUrl } from '../../../utils/url';
import { translate } from '../../../i18n';

const STATUS_TEXT = {
  [FOLDER_ACCESS.ask]: 'OpenMTP explains and asks you first',
  [FOLDER_ACCESS.allowed]: 'Allowed',
  [FOLDER_ACCESS.denied]: 'Blocked by macOS',
  [FOLDER_ACCESS.blocked]: 'Not used by OpenMTP',
};

// Rows of the settings dialog's "Folder access" section: one per protected
// location, with what OpenMTP may do there and the action that changes it.
class FolderAccessSettings extends PureComponent {
  // reading the folder makes macOS ask (once); the outcome is stored
  requestFolder = async (folder) => {
    const { actionSaveAccess } = this.props;

    // external disks are asked for by macOS when one is opened
    if (!folder.root) {
      actionSaveAccess(folder.id, FOLDER_ACCESS.allowed);

      return;
    }

    try {
      await fsPromises.readdir(folder.root);
      actionSaveAccess(folder.id, FOLDER_ACCESS.allowed);
    } catch (error) {
      actionSaveAccess(
        folder.id,
        isPermissionError(error) ? FOLDER_ACCESS.denied : FOLDER_ACCESS.ask
      );
    }
  };

  renderAction = (folder, status) => {
    const { appLanguage, actionSaveAccess } = this.props;
    const t = (key) => translate(appLanguage, key);

    if (status === FOLDER_ACCESS.allowed) {
      return (
        <M3Button
          variant="text"
          onClick={() => actionSaveAccess(folder.id, FOLDER_ACCESS.blocked)}
        >
          {t("Don't use")}
        </M3Button>
      );
    }

    if (status === FOLDER_ACCESS.denied) {
      return (
        <>
          <M3Button variant="text" onClick={() => this.requestFolder(folder)}>
            {t('Check again')}
          </M3Button>
          <M3Button
            variant="tonal"
            icon="open_in_new"
            onClick={(event) =>
              openExternalUrl(SYSTEM_SETTINGS_FILES_AND_FOLDERS, event)
            }
          >
            {t('System Settings')}
          </M3Button>
        </>
      );
    }

    return (
      <M3Button variant="tonal" onClick={() => this.requestFolder(folder)}>
        {t('Allow')}
      </M3Button>
    );
  };

  render() {
    const { styles, appLanguage, folderAccess } = this.props;
    const t = (key) => translate(appLanguage, key);
    const fullDiskAccess = hasFullDiskAccess();

    return (
      <>
        {PROTECTED_FOLDERS.map((folder) => {
          const status = fullDiskAccess
            ? FOLDER_ACCESS.allowed
            : folderAccessStatus(folderAccess, folder.id);

          return (
            <div key={folder.id} className={styles.row}>
              <MaterialSymbol
                name={folder.icon}
                size={24}
                className={styles.rowIcon}
              />
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{t(folder.label)}</span>
                <span className={styles.rowDescription}>
                  {fullDiskAccess
                    ? t('Allowed by Full Disk Access')
                    : t(STATUS_TEXT[status])}
                </span>
              </span>
              {!fullDiskAccess && (
                <span className={styles.rowControl}>
                  {this.renderAction(folder, status)}
                </span>
              )}
            </div>
          );
        })}
        <div className={styles.row}>
          <MaterialSymbol
            name="shield_lock"
            size={24}
            className={styles.rowIcon}
          />
          <span className={styles.rowText}>
            <span className={styles.rowTitle}>{t('Full Disk Access')}</span>
            <span className={styles.rowDescription}>
              {fullDiskAccess
                ? t('On: OpenMTP can open every folder without asking.')
                : t(
                    'Optional, not needed. Lets OpenMTP open every folder without asking.'
                  )}
            </span>
          </span>
          <span className={styles.rowControl}>
            <M3Button
              variant="text"
              icon="open_in_new"
              onClick={(event) =>
                openExternalUrl(SYSTEM_SETTINGS_FULL_DISK_ACCESS, event)
              }
            >
              {t('System Settings')}
            </M3Button>
          </span>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  folderAccess: makeFolderAccess(state),
});

const mapDispatchToProps = (dispatch) => ({
  actionSaveAccess: (folderId, status) =>
    dispatch(saveFolderAccess(folderId, status)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FolderAccessSettings);
